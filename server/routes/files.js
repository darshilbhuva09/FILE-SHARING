const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const shortid = require('shortid');
const File = require('../models/File');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${shortid.generate()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
}).single('file');

// Helper function to get file extension
const getFileExtension = (filename) => {
  return path.extname(filename).slice(1).toLowerCase();
};

// Helper function to determine file type category
const getFileType = (extension) => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
  const documentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
  const audioTypes = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
  
  if (imageTypes.includes(extension)) return 'image';
  if (documentTypes.includes(extension)) return 'document';
  if (videoTypes.includes(extension)) return 'video';
  if (audioTypes.includes(extension)) return 'audio';
  if (archiveTypes.includes(extension)) return 'archive';
  
  return 'other';
};

// Upload file route
router.post('/upload', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get file extension and type
    const extension = getFileExtension(req.file.originalname);
    const fileType = getFileType(extension);

    // Create file record with enhanced metadata
    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      type: fileType,
      extension: extension,
      uuid: shortid.generate(),
      uploadDate: new Date(),
      lastAccessed: new Date()
    });

    try {
      const response = await file.save();
      
      return res.json({
        file: `${process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 8000}`}/files/${response.uuid}`,
        uuid: response.uuid,
        fileName: response.originalName,
        fileSize: response.size,
        fileType: response.type
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
});

// Get file by UUID
router.get('/:uuid', async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Update last accessed timestamp
    file.lastAccessed = new Date();
    await file.save();

    const filePath = `${process.env.APP_BASE_URL || `http://localhost:${process.env.PORT || 8000}`}/files/${file.filename}`;
    
    return res.json({
      uuid: file.uuid,
      filename: file.originalName,
      size: file.size,
      type: file.type,
      extension: file.extension,
      downloadCount: file.downloadCount,
      uploadDate: file.uploadDate,
      downloadLink: filePath
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Direct file access route
router.get('/file/:filename', async (req, res) => {
  try {
    const file = await File.findOne({ filename: req.params.filename });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Update last accessed timestamp
    file.lastAccessed = new Date();
    await file.save();
    
    const filePath = path.join(__dirname, '..', file.path);
    res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Download file
router.get('/download/:uuid', async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Increment download count and update last accessed
    file.downloadCount++;
    file.lastAccessed = new Date();
    await file.save();
    
    const filePath = path.join(__dirname, '..', file.path);
    res.download(filePath, file.originalName);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get all files (admin route)
router.get('/', async (req, res) => {
  try {
    const files = await File.find({}).sort({ createdAt: -1 });
    return res.json(files);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

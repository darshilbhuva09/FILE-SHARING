const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fileRoutes = require('./routes/files');
const File = require('./models/File');

// Load environment variables from .env file
dotenv.config();

// Create uploads folder if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
  console.log('Uploads folder created');
}

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB using the URI from .env
console.log('Connecting to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB successfully!');
  console.log('Database name:', mongoose.connection.db.databaseName);
  
  // Verify the collections in the database
  mongoose.connection.db.listCollections().toArray()
    .then(collections => {
      console.log('Available collections in', mongoose.connection.db.databaseName + ':', 
                 collections.map(c => c.name));
    })
    .catch(err => {
      console.error('Error listing collections:', err);
    });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/files', fileRoutes);

// Handle direct file access
app.get('/files/:uuid', async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    
    if (!file) {
      return res.status(404).send('File not found');
    }

    // Update last accessed timestamp
    file.lastAccessed = new Date();
    await file.save();
    
    // Serve the file
    const filePath = path.join(__dirname, file.path);
    res.download(filePath, file.originalName);
  } catch (error) {
    console.error('Error accessing file:', error);
    return res.status(500).send('Server error');
  }
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

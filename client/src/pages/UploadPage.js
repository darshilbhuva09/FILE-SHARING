import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getFileTypeIcon = (file) => {
    if (!file) return '📁';
    
    const extension = file.name.split('.').pop().toLowerCase();
    
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const documentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt'];
    const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
    const audioTypes = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
    const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz'];
    
    if (imageTypes.includes(extension)) return '🖼️';
    if (documentTypes.includes(extension)) return '📄';
    if (videoTypes.includes(extension)) return '🎬';
    if (audioTypes.includes(extension)) return '🎵';
    if (archiveTypes.includes(extension)) return '🗄️';
    
    return '📁';
  };

  const onDrop = acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      // Navigate to file details page
      navigate(`/file/${response.data.uuid}`);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Error uploading file. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="file-sharing-page">
      <div className="upload-container">
        <div 
          {...getRootProps()} 
          className="dropzone"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the file here...</p>
          ) : (
            <div>
              <div className="dropzone-icon">
                {file ? getFileTypeIcon(file) : '📤'}
              </div>
              <p>Click to browse or drag files here to start sharing</p>
              <p style={{ fontSize: '12px', marginTop: '10px' }}>
                (Max file size: 100MB)
              </p>
            </div>
          )}
        </div>

      {file && (
        <div className="file-info">
          <p><strong>Selected file:</strong> {file.name}</p>
          <p><strong>Size:</strong> {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          <p><strong>Type:</strong> {file.type || 'Unknown'}</p>
        </div>
      )}

      {uploading && (
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <button 
        className="btn" 
        onClick={handleUpload} 
        disabled={!file || uploading}
      >
        {uploading ? 'Uploading...' : 'Upload & Share'}
      </button>
      </div>
      
      <div className="features-section">
        <h2>Share files directly from your device to anywhere</h2>
        <p className="feature-description">
          Send files of any size directly from your device without ever storing anything online.
        </p>
        
        <div className="feature-list">
          <div className="feature-item">
            <span className="feature-icon">∞</span>
            <span className="feature-text">No file size limit</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⟲</span>
            <span className="feature-text">Peer-to-peer</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">Blazingly fast</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <span className="feature-text">End-to-end encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;

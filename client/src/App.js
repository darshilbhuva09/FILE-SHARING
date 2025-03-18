import React, { useState } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('qr'); // Default tab is QR code
  const [copied, setCopied] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file first');
    
    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await axios.post('/api/files/upload', formData, {
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

      setLink(data.file);
      setUploading(false);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Error uploading file. Please try again.');
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  const handleReset = () => {
    setFile(null);
    setLink('');
    setUploadProgress(0);
    setError('');
  };

  return (
    <div style={{ 
      padding: '20px',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ color: '#ff7e5f', marginBottom: '16px' }}>Quanta-Share</h2>
      
      {!link ? (
        <>
          <label style={{ 
            display: 'block', 
            padding: '40px', 
            border: '2px dashed #ccc', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            transition: 'border-color 0.3s ease',
            backgroundColor: file ? '#f9f9f9' : 'transparent'
          }}>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files[0])} 
              style={{ display: 'none' }} 
            />
            <div style={{ fontSize: '16px', color: '#555' }}>
              {file ? (
                <>
                  <div style={{ marginBottom: '10px' }}>Selected file: {file.name}</div>
                  <div>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                </>
              ) : (
                <>
                  Click to browse or drag files here to start sharing
                  <br />
                  <span style={{ fontSize: '12px', color: '#999' }}>(Max file size: 100MB)</span>
                </>
              )}
            </div>
          </label>

          {uploading && (
            <div style={{ 
              height: '6px', 
              backgroundColor: '#f0f0f0', 
              borderRadius: '3px', 
              margin: '16px 0', 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                height: '100%', 
                width: `${uploadProgress}%`, 
                backgroundColor: '#ff7e5f', 
                transition: 'width 0.3s ease' 
              }}></div>
            </div>
          )}

          {error && (
            <div style={{ color: '#e74c3c', margin: '10px 0', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            style={{ 
              background: !file || uploading ? '#ccc' : '#ff7e5f', 
              color: '#fff', 
              padding: '12px 24px', 
              marginTop: '16px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: !file || uploading ? 'not-allowed' : 'pointer', 
              transition: 'background 0.3s ease' 
            }}
          >
            {uploading ? 'Uploading...' : 'Upload & Share'}
          </button>
        </>
      ) : null}

      {link && (
        <div style={{ 
          marginTop: link ? '0' : '30px', 
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          padding: '20px'
        }}>
          <h3 style={{ color: '#ff7e5f', marginBottom: '20px' }}>File Shared Successfully!</h3>
          
          {/* Tabs Navigation */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid #eee',
            marginBottom: '20px'
          }}>
            <button 
              onClick={() => setActiveTab('qr')}
              style={{
                flex: 1,
                padding: '10px',
                background: activeTab === 'qr' ? '#ff7e5f' : 'transparent',
                color: activeTab === 'qr' ? 'white' : '#555',
                border: 'none',
                borderBottom: activeTab === 'qr' ? '2px solid #ff7e5f' : 'none',
                cursor: 'pointer',
                fontWeight: activeTab === 'qr' ? 'bold' : 'normal',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
                transition: 'all 0.3s ease'
              }}
            >
              QR Code
            </button>
            <button 
              onClick={() => setActiveTab('link')}
              style={{
                flex: 1,
                padding: '10px',
                background: activeTab === 'link' ? '#ff7e5f' : 'transparent',
                color: activeTab === 'link' ? 'white' : '#555',
                border: 'none',
                borderBottom: activeTab === 'link' ? '2px solid #ff7e5f' : 'none',
                cursor: 'pointer',
                fontWeight: activeTab === 'link' ? 'bold' : 'normal',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
                transition: 'all 0.3s ease'
              }}
            >
              Share Link
            </button>
          </div>
          
          {/* Tab Content */}
          <div style={{ padding: '10px' }}>
            {activeTab === 'qr' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '15px', color: '#555' }}>Scan this QR code to download the file:</p>
                <div style={{ 
                  display: 'inline-block', 
                  background: 'white', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '1px solid #eee'
                }}>
                  <QRCode value={link} size={180} />
                </div>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#777', 
                  marginTop: '15px' 
                }}>
                  Works with any QR code scanner
                </p>
              </div>
            )}
            
            {activeTab === 'link' && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '15px', color: '#555' }}>Share this link with others:</p>
                <div style={{
                  marginBottom: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9',
                  padding: '8px',
                  position: 'relative'
                }}>
                  <div style={{
                    wordBreak: 'break-all',
                    textAlign: 'left',
                    padding: '4px 8px',
                    paddingRight: '60px',
                    fontSize: '14px',
                    color: '#333',
                    minHeight: '40px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {link}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '8px',
                      background: '#ff7e5f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '7px 12px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    display: 'inline-block',
                    background: '#ff7e5f',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Open Link
                </a>
              </div>
            )}
          </div>
          
          {/* Share Another File Button */}
          <div style={{ marginTop: '30px' }}>
            <button 
              onClick={handleReset}
              style={{ 
                background: '#555',
                color: '#fff', 
                padding: '10px 20px', 
                borderRadius: '8px', 
                border: 'none', 
                cursor: 'pointer', 
                transition: 'background 0.3s ease' 
              }}
            >
              Share Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FileDetailsPage = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2 style={{ color: '#ff7e5f' }}>File Details</h2>
      <p>This page will display file details</p>
    </div>
  );
};


const Footer = () => {
  return (
    <footer style={{ 
      textAlign: 'center',
      padding: '15px',
      marginTop: '20px',
      borderTop: '1px solid #eee',
      color: '#666',
      fontSize: '14px'
    }}>
      <p style={{ margin: 0 }}>© 2025 Quanta-Share. All rights reserved.</p>
    </footer>
  );
};

function App() {
  return (
    <Router>
      <div style={{ 
        fontFamily: 'Poppins, sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f9f9f9'
      }}>
        <main style={{ 
          flex: 1,
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/file/:uuid" element={<FileDetailsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

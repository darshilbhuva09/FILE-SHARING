import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

const FileDetailsPage = () => {
  const [fileDetails, setFileDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { uuid } = useParams();

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        const response = await axios.get(`/api/files/${uuid}`);
        setFileDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching file details:', error);
        setError('File not found or has been removed');
        setLoading(false);
      }
    };

    fetchFileDetails();
  }, [uuid]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fileDetails.downloadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="file-details">
        <p>Loading file details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-details">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="file-details">
      <h2>File Shared Successfully!</h2>
      
      <div>
        <p><strong>File name:</strong> {fileDetails.filename}</p>
        <p><strong>Size:</strong> {(fileDetails.size / (1024 * 1024)).toFixed(2)} MB</p>
      </div>
      
      <div className="qr-container">
        <h3>Scan QR Code to Download</h3>
        <QRCodeSVG 
          value={fileDetails.downloadLink} 
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      
      <div>
        <h3>Or use this download link:</h3>
        <div className="link-container">
          {fileDetails.downloadLink}
        </div>
        <button 
          className="copy-btn" 
          onClick={handleCopyLink}
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <a 
          href={`/api/files/download/${uuid}`} 
          className="btn"
          download
        >
          Download File
        </a>
      </div>
    </div>
  );
};

export default FileDetailsPage;
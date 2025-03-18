const fs = require('fs');
const path = require('path');

// Create uploads folder if it doesn't exist
const createUploadsFolder = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Uploads folder created');
  }
};

module.exports = {
  createUploadsFolder
};
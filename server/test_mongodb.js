const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://dhruvdaveit22:temp@file-sharing.6vdqm.mongodb.net/?retryWrites=true&w=majority&appName=file-sharing', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB successfully!');
  
  // Define a simple schema
  const TestSchema = new mongoose.Schema({
    name: String,
    createdAt: { type: Date, default: Date.now }
  });
  
  // Create a model
  const Test = mongoose.model('test', TestSchema, 'test');
  
  // Create and save a document
  const testDoc = new Test({ name: 'Test Document ' + Date.now() });
  
  return testDoc.save();
})
.then(doc => {
  console.log('Document saved successfully:', doc);
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
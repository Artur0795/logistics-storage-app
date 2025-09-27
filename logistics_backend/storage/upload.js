const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    
    cb(null, true);
  }
});

app.post('/api/upload/', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    message: 'Файл успешно загружен',
    file: req.file
  });
});
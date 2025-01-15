const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    
    cb(null, `public/uploads/`);
  },
  // Define how the file will be named on the server
  filename: function (req, file, cb) {

    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileSizeLimit = 1024 * 1024 * 10; // 10MB file size limit

const upload = multer({
  storage: storage,
  limits: {
    fileSize: fileSizeLimit,
  },
  fileFilter: function (req, file, cb) {
    // You can specify file type filters here if needed
    // For example, accept only images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true); // Accept the file if it passes the filter
  }
});

module.exports = upload;

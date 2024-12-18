const multer = require("multer");
const path = require("path");

/**
 * Middleware function that handles file uploads using the Multer library.
 * It sets up the storage configuration, file size and type restrictions, and processes the uploaded file.
 * If the file is successfully uploaded, it calls the next middleware function.
 * If there is an error, it sends an appropriate error response.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function to be called.
 */
const fileUpload = ( req, res, next ) => {
    //configuration for storage type
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "../../upload/");
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "_" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.mimetype)) {
        // @ts-ignore
        return cb(new Error("Only .jpeg and .png files are allowed"), false);
      }
      cb(null, true);
    },
  }).single("file");

  upload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).send("File size exceeds the 2MB limit.");
      }
      return res.status(400).send(err.message);
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    next();
  });
};

module.exports = fileUpload;

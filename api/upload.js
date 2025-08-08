const connectDB = require('../backend/config/db');
const auth = require('./middleware/auth');
const multer = require('multer');
const AWS = require('aws-sdk');
const Image = require('../backend/models/Image');
const sharp = require('sharp');
const connectDB = require('../backend/config/db');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION || 'us-east-1' // Default region, change if needed
});

// Configure Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

module.exports = auth(async (req, res) => {
  await connectDB();

  if (req.method === 'POST') {
    // Multer middleware for parsing multipart/form-data
    upload.single('image')(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ msg: err.message });
      } else if (err) {
        return res.status(500).json({ msg: err.message });
      }

      try {
        const { originalname, buffer, mimetype } = req.file;
        const { category } = req.body;
        const userId = req.user.id;

        // Compress image
        const compressedImageBuffer = await sharp(buffer)
          .resize({ width: 800, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();

        const s3Key = `${userId}/${Date.now()}_${originalname}`;
        const s3Params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME, // Use environment variable for S3 bucket name
          Key: s3Key,
          Body: compressedImageBuffer,
          ContentType: mimetype,
          ACL: 'public-read',
        };

        const s3Data = await s3.upload(s3Params).promise();

        const newImage = new Image({
          user: userId,
          url: s3Data.Location,
          filename: originalname,
          s3Key: s3Key,
          category: category || 'Uncategorized',
        });

        const image = await newImage.save();
        res.status(200).json(image);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });
  } else {
    res.status(405).send('Method Not Allowed');
  }
});
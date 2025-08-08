const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const AWS = require('aws-sdk');
const Image = require('../models/Image');

// Configure AWS
// Make sure to set your AWS credentials in your environment variables
const sharp = require('sharp');
const s3 = new AWS.S3();

// Configure Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

// @route   POST api/images/upload
// @desc    Upload an image
// @access  Private
router.post('/upload', [auth, upload.single('image')], async (req, res) => {
  try {
    const { originalname, buffer, mimetype } = req.file;
    const { category } = req.body;
    const userId = req.user.id;

        // Compress image
    const compressedImageBuffer = await sharp(buffer)
      .resize({ width: 800, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    const s3Params = {
      Bucket: 'your-s3-bucket-name', // Replace with your S3 bucket name
      Key: `${userId}/${Date.now()}_${originalname}`,
      Body: compressedImageBuffer,
      ContentType: mimetype,
      ACL: 'public-read',
    };

    const s3Data = await s3.upload(s3Params).promise();

    const newImage = new Image({
      user: userId,
      url: s3Data.Location,
      filename: s3Data.Key,
      category: category || 'Uncategorized',
    });

    const image = await newImage.save();
    res.json(image);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/images
// @desc    Get all images for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const images = await Image.find({ user: req.user.id }).sort({ date: -1 });
    res.json(images);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/images/:id
// @desc    Update image category
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ msg: 'Image not found' });
        }
        // Make sure user owns the image
        if (image.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        image.category = req.body.category;
        await image.save();

        res.json(image);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/images/:id
// @desc    Delete an image
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }

    // Make sure user owns the image
    if (image.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // TODO: Delete image from S3

    await image.remove();

    res.json({ msg: 'Image removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
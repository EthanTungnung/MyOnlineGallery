const connectDB = require('../../backend/config/db');
const auth = require('../middleware/auth');
const Image = require('../../backend/models/Image');
const connectDB = require('../../backend/config/db');
const AWS = require('aws-sdk');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION || 'us-east-1' // Default to us-east-1 if not set
});

module.exports = auth(async (req, res) => {
  await connectDB();

  const { id } = req.query; // Get the image ID from the URL parameter

  try {
    let image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }

    // Make sure user owns the image
    if (image.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (req.method === 'PUT') {
      image.category = req.body.category;
      await image.save();
      res.status(200).json(image);
    } else if (req.method === 'DELETE') {
      // Delete image from S3
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: image.s3Key // Assuming your Image model stores the S3 Key
      };

      try {
        await s3.deleteObject(params).promise();
        console.log('Image deleted from S3 successfully');
      } catch (s3Err) {
        console.error('Error deleting image from S3:', s3Err);
        return res.status(500).json({ msg: 'Error deleting image from S3' });
      }

      await image.remove();
      res.status(200).json({ msg: 'Image removed' });
    } else {
      res.status(405).send('Method Not Allowed');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

  const { id } = req.query; // Get the image ID from the URL parameter

  try {
    let image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }

    // Make sure user owns the image
    if (image.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (req.method === 'PUT') {
      image.category = req.body.category;
      await image.save();
      res.status(200).json(image);
    } else if (req.method === 'DELETE') {
      // TODO: Delete image from S3
      await image.remove();
      res.status(200).json({ msg: 'Image removed' });
    } else {
      res.status(405).send('Method Not Allowed');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
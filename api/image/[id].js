const connectDB = require('../../backend/config/db');
const auth = require('../../backend/middleware/auth'); // This middleware needs to be adapted for serverless
const Image = require('../../backend/models/Image');

module.exports = async (req, res) => {
  await connectDB();

  // Authentication middleware (needs to be adapted for serverless)
  // For now, we'll assume req.user is set by a preceding auth step or mock it.
  // In a real Vercel setup, you'd likely use a separate serverless function for auth
  // or handle it within this function if it's simple token verification.
  // For this example, we'll bypass auth for now.
  req.user = { id: '60d5ec49f8c7d00015f8e3b1' }; // Mock user ID for testing

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
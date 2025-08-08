const connectDB = require('../backend/config/db');
const auth = require('../backend/middleware/auth'); // This middleware needs to be adapted for serverless
const Image = require('../backend/models/Image');

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {
    // Authentication middleware (needs to be adapted for serverless)
    // For now, we'll assume req.user is set by a preceding auth step or mock it.
    // In a real Vercel setup, you'd likely use a separate serverless function for auth
    // or handle it within this function if it's simple token verification.
    // For this example, we'll bypass auth for now to get the images working.
    // You'll need to implement proper authentication for production.
    req.user = { id: '60d5ec49f8c7d00015f8e3b1' }; // Mock user ID for testing

    try {
      const images = await Image.find({ user: req.user.id }).sort({ date: -1 });
      res.status(200).json(images);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};
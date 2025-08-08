const connectDB = require('../backend/config/db');
const auth = require('./middleware/auth');
const Image = require('../backend/models/Image');
const connectDB = require('../backend/config/db');

module.exports = auth(async (req, res) => {
  await connectDB();

  if (req.method === 'GET') {

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
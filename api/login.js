const connectDB = require('../backend/config/db'); // Assuming you'll create this
const User = require('../backend/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === 'POST') {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'User does not exist' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your_jwt_secret', // Use environment variable for secret
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};
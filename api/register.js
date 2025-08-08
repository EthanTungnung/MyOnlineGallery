const connectDB = require('../backend/config/db'); // Assuming you'll create this
const User = require('../backend/models/User');
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
  await connectDB();

  if (req.method === 'POST') {
    const { name, email, password } = req.body;

    // Simple validation
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const newUser = new User({
        name,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(newUser.password, salt);

      await newUser.save();

      res.status(200).json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
};
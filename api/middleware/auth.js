const jwt = require('jsonwebtoken');

module.exports = (handler) => async (req, res) => {
  const token = req.headers['x-auth-token'];

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return handler(req, res);
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};
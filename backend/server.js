const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '..')));

// API routes
app.use('/api/users', require('./routes/users'));
app.use('/api/images', require('./routes/images'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost/myonlinegallery', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/foodwaste')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB Error:', err));

// Routes
app.use('/api/food', require('./routes/food'));
app.use('/api/ngos', require('./routes/ngos'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => res.json({ message: 'ZeroWasteMess API running 🌿' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  focus: { type: String }, // e.g. "Children", "Homeless"
  distance: { type: Number }, // in km from hostel
  status: { type: String, enum: ['Active', 'Busy', 'Inactive'], default: 'Active' },
  totalMeals: { type: Number, default: 0 },
  rating: { type: Number, default: 5.0 },
}, { timestamps: true });

module.exports = mongoose.model('NGO', ngoSchema);

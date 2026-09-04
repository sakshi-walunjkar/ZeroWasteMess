const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  item: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: ['kg', 'pieces', 'litres', 'servings'], default: 'kg' },
  mess: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'In Transit', 'Delivered', 'Expired'], default: 'Pending' },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', default: null },
  notes: { type: String, default: '' },
  loggedBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);

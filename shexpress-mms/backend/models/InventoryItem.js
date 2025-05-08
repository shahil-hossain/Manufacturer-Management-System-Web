
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  material: { type: String, required: true },
  quantity: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema);

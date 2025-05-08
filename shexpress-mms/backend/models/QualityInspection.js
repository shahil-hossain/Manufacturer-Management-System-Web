const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  batchId: String,
  inspector: String,
  status: String,
  action: String,
  date: String
}, { timestamps: true });

module.exports = mongoose.model('QualityInspection', inspectionSchema);
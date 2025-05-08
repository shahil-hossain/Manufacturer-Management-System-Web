const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  division: { type: String, required: true },
  district: { type: String, required: true },
  address: { type: String, required: true },
  status: { 
    type: String,
    enum: ["Scheduled", "In Transit", "Delivered"],
    required: true
  },
  date: { type: Date, required: true }
});

module.exports = mongoose.model("Delivery", deliverySchema);
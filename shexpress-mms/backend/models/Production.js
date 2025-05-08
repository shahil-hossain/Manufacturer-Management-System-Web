const mongoose = require("mongoose");

const productionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  date: { type: String, required: true },
  status: {
    type: String,
    enum: ["Scheduled", "In Progress", "Completed"],
    default: "Scheduled"
  }
});

module.exports = mongoose.model("Production", productionSchema);


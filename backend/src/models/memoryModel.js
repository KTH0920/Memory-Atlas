const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  tags: [String],
  date: { type: String },
  imageUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Memory", memorySchema);

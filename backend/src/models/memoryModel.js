const mongoose = require("mongoose");

const memorySchema = new mongoose.Schema({
  title: String,
  desc: String,
  lat: Number,
  lng: Number,
  date: String,
  tags: [String],
  imageUrl: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Memory", memorySchema);

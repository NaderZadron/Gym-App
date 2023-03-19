const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  dateOfClass: {
    type: String,
    required: true,
  },
  timeOfClass: {
    type: String,
    required: true,
  },
  trainerName: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  typeOfClass: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  attendants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Class", classSchema);

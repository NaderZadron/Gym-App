const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  checkedIn: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.googleAuth;
    },
  },
  googleAuth: { type: Boolean, default: false },
  balance: { type: Number, default: 1000000 },
  token: { type: String },
  resetPasswordExpires: { type: Date },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

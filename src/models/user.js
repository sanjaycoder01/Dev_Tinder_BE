const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  age: Number,
  gender: {
    type: String,
    validate(value) {
      if (value !== "Male" && value !== "Female" && value !== "Other") {
        throw new Error("Gender must be Male, Female or Other");
      }
    }
  },
  location: String,
  skills: {
    type: [String],
    minlength: 1,
    maxlength: 10,
    required: true,
    validate(value) {
      if (value.length < 3) {
        throw new Error("Skills must be at least 3 characters long");
      }
      if (value.length > 10) {
        throw new Error("Skills must be less than 10 characters long");
      }
    }
  },
  about: {
    type: String,
    default: "hi this is deafult value"
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
const mongoose = require("mongoose");
const validator = require("validator");
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
    trim: true,
    validate(value) {
      if(!validator.isEmail(value)){
        throw new Error("Invalid email format");
      }
    }
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
  location: {
    type: String,
    validate(value) {
      // Location is optional, but if provided must be at least 3 characters
      if (value && value.length < 3) {
        throw new Error("Location must be at least 3 characters long");
      }
    }
  },
  skills: {
    type: [String],
    validate(value) {
      // Skills are optional, but if provided must be valid
      if (value && value.length > 0) {
        // Check array has no more than 10 skills
        if (value.length > 10) {
          throw new Error("Maximum 10 skills allowed");
        }
        // Check each skill is a non-empty string
        for (let skill of value) {
          if (!skill || skill.trim().length === 0) {
            throw new Error("Each skill must be a non-empty string");
          }
        }
      }
    }
  },
  about: {
    type: String,
    default: "hi this is deafult value"
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
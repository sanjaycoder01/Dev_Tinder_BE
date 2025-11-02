const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../utils/validation");
const jwt = require("jsonwebtoken");
authRouter.post("/signup", async (req, res) => {
    try {
      const { name, email, password, age, gender, location } = req.body;
      validateSignUpData(req);
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists"
        });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);
      // Create new user
      const user = new User({
        name,
        email,
        password: hashedPassword,
        age: age || null,
        gender: gender || null,
        location: location || null
      });
  
      // Save user to database
      await user.save();
  
      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          location: user.location
        }
      });
  
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  });
  authRouter.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid password"
        });
      }
      const token = jwt.sign({ userId: user._id }, "sanjay@123", { expiresIn: "0.5h" });
      console.log(token);
      // Set cookie before sending JSON response
      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 0.5 * 60 * 1000) // 0.5 hours
      });
  
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: user
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  });
  

module.exports = authRouter;
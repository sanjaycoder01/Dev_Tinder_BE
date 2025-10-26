const express = require("express");
const connectDB = require("./config/database");
const app = express();

// Import middleware
const { adminauth,userauth } = require("./middlewares/adminauth");
const User = require("./models/user");

// Body parsing middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Use middleware
app.use("/", userauth);

// Define routes
app.get("/admin/getAllData", (req, res) => {
  res.send("All Data");
});
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, age, gender, location } = req.body;
    
    // Validation - check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    
    // Create new user
    const user = new User({
      name,
      email,
      password,
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
// Start server only after database connection
const startServer = async () => {
  try {
    // Wait for database connection
    const dbConnected = await connectDB();
    
    if (dbConnected) {
      // Start the server only if database is connected
      app.listen(3000, () => {
        console.log("Server is running on port 3000");
        console.log("Database connection established successfully");
      });
    } else {
      console.error("Failed to connect to database. Server not started.");
      process.exit(1); // Exit the process if database connection fails
    }
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

// Start the application
startServer();
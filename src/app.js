const express = require("express");
const connectDB = require("./config/database");
const app = express();
const validator = require("validator");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
// Import middleware
const { adminauth,userauth } = require("./middlewares/adminauth");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
// Body parsing middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Cookie parser middleware (must be before userauth)
app.use(cookieParser());
// Define routes
app.get("/admin/getAllData", (req, res) => {
  res.send("All Data");
});
app.post("/signup", async (req, res) => {
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
      password:hashedPassword,
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

app.post("/login", async (req, res) => {  
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
    const token = jwt.sign({ userId: user._id }, "sanjay@123");
    console.log(token);
    // Set cookie before sending JSON response
    res.cookie("token", token, {
      httpOnly: true,
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

app.get("/profile",userauth, async (req, res) => {
  try{
const user=req.user;
res.send(user);
} catch (error) {
  console.error("Error retrieving profile:", error);
  res.status(400).send(error.message);
}
});

// GET all users endpoint
app.get('/feed', async (req, res) => {
  try {
    // Fetch all users from database
    const users = await User.find({});
    
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      count: users.length,
      data: users
    });
    
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// GET user by email endpoint
app.get("/user/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    res.status(200).json({
      success: true,
      message: "User found successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error finding user by email:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// GET user by ID endpoint
app.get("/user/id/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this ID",
      });
    }
    
    res.status(200).json({
      success: true,
      message: "User found successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error finding user by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
app.get("/user/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
   const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this ID",
      });
    }
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
app.patch("/user/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, age, gender, location,skills,about } = req.body;
    const ALLOWED_UPDATES=["name","password","age","gender","location","skills","about"];
    for(const update of Object.keys(req.body)){
      if(!ALLOWED_UPDATES.includes(update)){
        return res.status(400).json({
          success: false,
          message: `Invalid update: ${update} is not allowed`,
        });
      }
    }
    // Validate MongoDB ObjectId format
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }
    
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found with this ID",
      });
    }
    
    // Update user and return updated document
    const user = await User.findByIdAndUpdate(
      id, 
      { name, email, password, age, gender, location,skills,about },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
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
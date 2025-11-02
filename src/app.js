const express = require("express");
const connectDB = require("./config/database");
const app = express();
const validator = require("validator");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
// // Import middleware
// const { adminauth, userauth } = require("./middlewares/adminauth");
// const User = require("./models/user");
// const { validateSignUpData } = require("./utils/validation");
// Body parsing middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Cookie parser middleware (must be before userauth)
app.use(cookieParser());
  // Define routes
  // app.get("/admin/getAllData", (req, res) => {
  //   res.send("All Data");
  // });
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
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
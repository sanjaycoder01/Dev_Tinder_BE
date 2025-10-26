const express = require("express");
const connectDB = require("./config/database");
const app = express();

// Import middleware
const { adminauth } = require("./middlewares/adminauth");

// Use middleware
app.use("/", adminauth);

// Define routes
app.get("/admin/getAllData", (req, res) => {
  res.send("All Data");
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
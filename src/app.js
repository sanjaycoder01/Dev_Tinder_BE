const express = require("express");
const app = express();

app.use("/home", (req, res) => {
    console.log("Hello World");
  res.send("Hello World");
});
app.use("/about", (req, res) => {
    console.log("About");
    res.send("About");
});
app.use("/contact", (req, res) => {
    console.log("Contact");
    res.send("Contact");
});
app.use("/", (req, res) => {
    console.log("Home");
    res.send("Home");
});
app.listen(3500, () => {
  console.log("Server is running on port 3500");
});
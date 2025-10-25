const express = require("express");
const app = express();
// app.use("/", (req, res) => {
//   console.log("Home");
//   res.send("Home");
// });
// app.use("/home", (req, res) => {
//   console.log("Hello World");
// res.send("Hello World");
// });
// app.use("/home/2", (req, res) => {
//     console.log("Home 2");
//     res.send("Home 2");
// });

// app.use("/about", (req, res) => {
//     console.log("About");
//     res.send("About");
// });
// app.use("/contact", (req, res) => {
//     console.log("Contact");
//     res.send("Contact");
// });



//middleware chain
// app.get("/info", (req, res,next) => {
//   console.log("Info 1");
//     res.send("Info1");
//     next();
// },(req, res) => {
//   console.log("Info 2");
//     res.send("Info 2");
// });


//multiple routes
app.get("/info", (req, res,next) => {
    res.send("Info");
    next();
});
//tHis is called route handler
app.get("/info1", (req, res,next) => {
    res.send("Info1");
    next();
});






app.get("/", (req, res) => {
    console.log("Home");
    res.send("Home");
});
// http://localhost:3000/about?userId=101&name=sabnjay
app.get("/about", (req, res) => {
  console.log(req.query);
res.send({name: "John", age: 20})
});
// http://localhost:3000/about/101/abc
app.get("/about/:userId/:name", (req, res) => {
    console.log(req.params);
    res.send("User ID: " + req.params.userId + " User Name: " + req.params.name);
});
app.post("/contact", (req, res) => {
    res.send("data sent to the server");
});
app.get("/contact", (req, res) => {
    console.log("Contact");
    res.send("Contact");
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
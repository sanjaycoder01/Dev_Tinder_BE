const adminauth=(req, res, next) => {
  const token="abc1234";
  if(token==="abc1234"){
    console.log("Token is valid");
    next();
  }else{
    console.log("Token is invalid");
    res.status(401).send("Unauthorized");
  }
};
const userauth=(req, res, next) => {
  const token="abc12345";
  if(token==="abc12345"){
    console.log("user Token is valid");
    next();
  }else{
    console.log("user  Token is invalid");
    res.status(401).send("Unauthorized");
  }
};
module.exports={adminauth,userauth};
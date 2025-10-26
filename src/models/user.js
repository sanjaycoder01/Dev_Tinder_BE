const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
  name:String,
  email:String,
  password:String,
  age:Number,
  gender:String,
  location:String,
});

const User=mongoose.model("User",userSchema);

module.exports=User;
const validator=require("validator");
const validateSignUpData=(req)=>{
    const {name,email,password,age,gender,location}=req.body;
    if(!name){
        throw new Error("Name is required");
    }
    if(!email){
        throw new Error("Email is required");
    }
    if(!password){
        throw new Error("Password is required");
    }
    if(!age){
        throw new Error("Age is required");
    }
    if(!gender){
        throw new Error("Gender is required");
    }
    if(!location){
        throw new Error("Location is required");
    }
    if(!validator.isEmail(email)){
        throw new Error("Invalid email format");
    }
    if(!validator.isStrongPassword(password)){
        throw new Error("Password is not strong enough");
    }
    if(!validator.isNumeric(age)){
        throw new Error("Age must be a number");
    }
    if(age<18){
        throw new Error("Age must be at least 18");
    }
    if(gender!="Male" && gender!="Female" && gender!="Other"){
        throw new Error("Gender must be Male, Female or Other");
    }
    if(location.length<3){
        throw new Error("Location must be at least 3 characters long");
    }
}
module.exports={
    validateSignUpData
}
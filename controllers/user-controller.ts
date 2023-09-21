import db from '../models';

const Sequelize = require("sequelize");

const User = db.user;


exports.updateUser = async(req) => {
  if(!req){
    return {
      errorCode: 500,
      message: " Fields to be updated required!",
      errorMessage: " Fields to be updated required!"
    }
  }

  try{
    const response = await User.findOne({where:{
      email: req.email.toLowerCase()
    }})

    if(!response){
      return {
        errorCode: 403,
        message: "User with the given email id does not exists",
        errorMessage: "User with the given email id does not exists"
      }
    }
    else{
      await User.update({...req}, {where:{email: req.email.toLowerCase()}})
      return {
        status: 200,
        message: "User details updated successfully"
      }
    }

  }
  catch(err){
    console.log("error in forgotPassword controller:", err)
    return err
  }
}

exports.ifUserIdExists = async(req) => {

    if(!req.userId){
      return {
        errorCode: 500,
        message: "userId cannot be empty!",
        errorMessage: "userId cannot be empty!"
      }
    }
  
    try{
      const response = await User.findOne({where:{
        userId: req.userId
      }})
  
  
      if(!response){
        return {
          errorCode: 404,
          message: "User not registerd, Please register first",
          errorMessage: "User not registerd, Please register first"
        }
      }
  
      return response
    }
    catch(err){
      console.log("error in ifUserIdExists controller:", err)
      return err
    }
  }



  exports.getUser = async(req) => {

    if(!req.userId){
      return {
        errorCode: 500,
        message: "userId cannot be empty!",
        errorMessage: "userId cannot be empty!"
      }
    }
  
    try{
      const response = await User.findOne({where:{
        userId: req.userId
      }})
  
  
      if(!response){
        return {
          errorCode: 500,
          message: "User not registerd, Please register first",
          errorMessage: "User not registerd, Please register first"
        }
      }
        return {
        status: 200, 
        message:"User Details Fetched Successfully", 
        data: {
          name: response?.dataValues?.name, 
          email: response?.dataValues?.email.toLowerCase(), 
          phoneNumber: response?.dataValues?.phoneNumber,
          countryCode: response?.dataValues?.countryCode,
          gender: response?.dataValues?.gender,
          timeZone: response?.dataValues?.timeZone,
          dob: response?.dataValues?.dob,
        }}
    }
    catch(err){
      console.log("error in getUser controller:", err)
      return err
    }
  }

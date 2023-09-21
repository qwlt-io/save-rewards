import db from '../models';
import CommonUtils from '../utils/common';
import { v4 as uuidv4 } from 'uuid';

const User = db.user;
const Session = db.appSession;
const AppSession = db.appSession;


exports.getUserByEmail = async(req) => {
  if(!req.email){
    return {
      errorCode: 403,
      message: 'Email cannot be empty',
      errorMessage: 'Please provide an email id!'
    }
  }
  try{
    const response = await User.findOne({
      where:{
        email: req?.email?.toLowerCase()
      }
    })
    if(!response){
      return {
        errorCode: 400,
        message: `No user found`,
        errorMessage: `No user found for given email`
      }
    }
    return response?.userId
  }catch(err){
    return {
      errorCode: 500,
      message: `Something went wrong`,
      errorMessage: `Error fetching user details using email`
    }
  }
}

exports.login = async(req) => {

  if(!req.email){
    return {
      errorCode: 403,
      message: "email cannot be empty!",
      errorMessage: "Please provide an email id!"
    }
  }

  try{
    const response = await User.findOne({where:{
      email: req.email.toLowerCase(),
    }})

    if(!response){
      return {
        errorCode: 403,
        message: "Please check the email id",
        errorMessage: "Please check the email id"
      }
    }


    const isPasswordValid = CommonUtils.checkPassword(req?.password, response?.dataValues?.password);


    if (isPasswordValid) {
      if(!response?.dataValues?.isEmailVerified){
        return {
          errorCode: 403,
          message: "Please verify email id before login",
          errorMessage: "Email id not verified"
        }
      }

      return response
    } else {
      return {
        errorCode: 403,
        message: `Password is invalid`,
        errorMessage: `Password is invalid`
      }
    }
  }
  catch(err){
    return {
      errorCode: 500,
      message:"Something went wrong, please try again",
      errorMessage: `Error in login controller -> ${err}`
    }
  }
}


//create Session 

exports.updateSessionByAppSessionId = async(req) => {
  //Validate request

  // if(!req.userId){
  //   return {
  //     errorCode: 403,
  //     errorMessage: "userId cannot be empty!"
  //   }
  // }

  try{

    const response = await Session.update({...req}, {where:{appSessionId: req.appSessionId}})

    return response
  }
  catch(err){
    console.log("error in updateSession controller:", err)
    return {
      errorCode: 500,
      message: "Something went wrong while updating the session",
      errorMessage: `Error ${err}`
    }
  }
}


exports.updateSessionByUserId = async(req) => {
  //Validate request

  if(!req.userId){
    return {
      errorCode: 403,
      message: "userId cannot be empty!",
      errorMessage: "userId cannot be empty!"
    }
  }

  try{

    const response = await Session.update({...req}, {where:{userId: req.userId}})

    return response
  }
  catch(err){
    console.log("error in updateSession controller:", err)
    return {
      errorCode: 500,
      message: "Something went wrong while updating the session",
      errorMessage: `Error ${err}`
    }
  }
}

exports.getAppSessionDetails = async(req) => {
  try{
    let appSession = {};
    if(!req.userId){
      return {
        errorCode: 500,
        message: "userId cannot be empty!",
        errorMessage: "userId cannot be empty!"
      }
    }
    appSession = await AppSession.findOne({where:{
      userId: req.userId,
      appSessionStatus: 'ACTIVE'
    }})
    if(!appSession){
      return {
        errorCode: 400,
        message: "No app session found for user",
        errorMessage: "App session is inactive. Please login again"
      }
    }
    return appSession;
  }catch(err){
    console.log("error in updateSession controller:", err)
    return {
      errorCode: 500,
      message: "Something went wrong while fetching app session",
      errorMessage: `Error ${err}`
    }
  }
}




exports.createSession = async(req) => {
  //Validate request

  if(!req.userId){
    return {
      errorCode: 500,
      message: "userId cannot be empty!",
      errorMessage: "userId cannot be empty!"
    }
  }

  try{
    const response = await Session.create({
      appSessionId:req.appSessionId,
      userId: req.userId,
      isAppSessionExpired:req.isAppSessionExpired,  
      appSessionStatus: req.appSessionStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return response
  }
  catch(err){
    console.log("error in deleteUser controller:", err)
    return err
  }
}

exports.deleteUser = async(req) => {

  if(!req.userId){
    return {
      errorCode: 403,
      message: "userId cannot be empty!",
      errorMessage: "userId cannot be empty!"
    }
  }

  try{
    const response = await User.destroy({where:{
      userId: req.userId
    }})

    console.log("Response of deeleUser:", response)

    return response
  }
  catch(err){
    console.log("error in deleteUser controller:", err)
    return {
      errorCode: 500,
      message: "Something went wrong while deleting the user",
      errorMessage: `Error: ${err}`
    }
  }
}


exports.ifEmailExists = async(req) => {

  if(!req.email){
    return {
      errorCode: 500,
      message: "email cannot be empty!",
      errorMessage: "email cannot be empty!"
    }
  }

  try{
    const response = await User.findOne({where:{
      email: req.email.toLowerCase()
    }})


    if(!response){
      return {
        errorCode: 500,
        message: "User not registerd, Please register first",
        errorMessage: "User not registerd, Please register first"
      }
    }

    return response
  }
  catch(err){
    console.log("error in ifEmailExists controller:", err)
    return err
  }
}

exports.signup = async(req) => {
  //Validate request
  if(!req.email){
    const message = "email cannot be empty!"
    return message;
  }

  try{
    const doesUserExists = await User.findOne({where:{
      email: req.email.toLowerCase(),
    }})

    console.log("doesUserExists:", doesUserExists)
    if(doesUserExists){
      return {
        errorCode: 500,
        message: "User with the given email already exists",
        errorMessage: "User with the given email already exists"
      }
    }
    else{
    const createdUser = await User.create({
      id: uuidv4(),
      userId: req.userId,
      email: req.email.toLowerCase(),
      password: req.password,
      status: "INACTIVE",
      externalUserId: req?.externalUserId,
      isEmailVerified: req?.isEmailVerified,
      isFirstLogin: req?.isFirstLogin,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    if(!createdUser){
      return {
        errorCode: 500,
        message: "Something went wrong",
        errorMessage: "Something went wrong while creating a user"
      }
    }

    return {
      createdUser: createdUser,
      status: 200,
      message: "User created successfully, verify the email to activate the user"
    }
  }

  }
  catch(e){
    console.log("error in signup controller:", e)
    return {
      errorCode: 500,
      message: "Something went wrong",
      errorMessage: `Error: ${e}`
    }
  }

}

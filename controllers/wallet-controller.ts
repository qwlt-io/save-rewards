import db from '../models';
import { Op } from 'sequelize';

const Sequelize = require("sequelize");

const WalletMaster = db.walletMaster
const Wallet = db.wallet
const WalletTransactions = db.walletTransactions


exports.ifWalletExists = async(req) => {
  if(!req.userId){
    return {
      errorCode: 500,
      message: "userId cannot be empty!",
      errorMessage: "userId cannot be empty!"
    }
  }

  try{
    const response = await WalletMaster.findOne({where:{
      userId: req.userId
    }})

    return response
  }
  catch(err){
    console.log("error in ifWalletExists controller:", err)
    throw err
  }
}



exports.createEntryInWalletMaster = async(req) => {
  //Validate request

  if(!req.userId && !req.walletId){
    return {
      errorCode: 500,
      message: "userId and walletId cannot be empty!",
      errorMessage: "userId and walletId cannot be empty!"
    }
  }

  try{
    const response = await WalletMaster.create({
      userId: req.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return response
  }
  catch(err){
    console.log("error in createEntryInWalletMaster controller:", err)
    throw err
  }
}


exports.createEntryInWallet = async(req) => {
  //Validate request

  if(!req.walletId){
    return {
      errorCode: 500,
      message: "walletId cannot be empty!",
      errorMessage: "walletId cannot be empty!"
    }
  }

  console.log("createEntryInWallet:", req)

  try{
    const response = await Wallet.create({
      walletId:req.walletId,
      activePoints: req.activePoints,
      expiredPoints: req.expiredPoints,
      earnedPoints: req.earnedPoints,
      usedPoints: req.usedPoints,
      coinType: req.coinType,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return response
  }
  catch(err){
    console.log("error in createEntryInWallet controller:", err)
    throw err
  }
}

exports.createEntryInWalletTransaction = async(req) => {
  //Validate request

  if(!req.walletId){
    return {
      errorCode: 500,
      message: "walletId cannot be empty!",
      errorMessage: "walletId cannot be empty!"
    }
  }

  try{
    const response = await WalletTransactions.create({
      walletId:req.walletId,
      txnType: req.txnType,
      rewardPoints: req.rewardPoints,
      rewardTypeId: req.rewardTypeId,
      coinType: req?.coinType,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return response
  }
  catch(err){
    console.log("error in createEntryInWalletTransaction controller:", err)
    throw err
  }
}




exports.updateWallet = async(req) => {
  console.log("req in updateWallet:", req)
  if(!req){
    return {
      errorCode: 500,
      message: " Fields to be updated required!",
      errorMessage: " Fields to be updated required!"
    }
  }

  try{
    const response = await Wallet.findOne({where:{
      walletId: req.walletId,
      coinType:req.coinType
    }})

    if(!response){
      return {
        errorCode: 403,
        message: "Given Wallet does not exist",
        errorMessage: "Given Wallet does not exist"
      }
    }
    else{
      await Wallet.update({...req}, {where:{walletId: req.walletId, coinType:req.coinType}})
      return {
        status: 200,
        message: "Wallet details updated successfully"
      }
    }

  }
  catch(err){
    console.log("error in updateWallet controller:", err)
    throw err
  }
}


exports.getWalletEntry = async(req) => {
  if(!req.walletId){
    return {
      errorCode: 500,
      message: "walletId cannot be empty!",
      errorMessage: "walletId cannot be empty!"
    }
  }

  try{
    const response = await Wallet.findAll({where:{
      walletId: req.walletId,
      coinType:req?.coinType
    }})

    response.sort((a, b) => {
      if (a.coinType === "QWLT") {
        return -1; // a should come before b
      } else if (b.coinType === "QWLT") {
        return 1; // b should come before a
      } else {
        return 0; // maintain the existing order
      }
    });

    //TODO:: Handle the case where there is some error fetching from db

    return response
  }
  catch(err){
    throw err
  }
}

exports.getEntriesFromWalletTransactions = async(req) => {


  if(!req.walletId){
    return {
      errorCode: 500,
      message: "walletId cannot be empty!",
      errorMessage: "walletId cannot be empty!"
    }
  }



  try{
    const response = await WalletTransactions.findAll({where:{
      walletId: req.walletId,
      createdAt: {
        [Op.between]: [req.startDate, req.endDate],
      },
    }})

    console.log("response getEntriesFromWalletTransactions:", response)

    return response
  }
  catch(err){
    console.log("ERRROR in catch block:", err)
    throw err
  }
}




import { v4 as uuidv4 } from 'uuid';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export default class CommonUtils{

    public static isDecimal(value: any): boolean {
      return typeof value === 'number' && !isNaN(value) && value % 1 !== 0;
    }

    public static convertToInteger(decimalValue: number): number {
      return Math.floor(decimalValue); // Use Math.ceil() for rounding up
    }

    public static convertToMilliseconds(timestamp) {
      if(this.isDecimal(timestamp)){
        timestamp = this.convertToInteger(timestamp)
      }
    if (timestamp.toString().length <= 10) {
        // Assuming timestamp is in seconds (10-digit or fewer)
        return timestamp * 1000; // Convert seconds to milliseconds
    } else {
        // Assuming timestamp is already in milliseconds
        return timestamp;
    }
   }

    public static isValidInput(input){
        if(!input || input === undefined || input === null || input === ''){
            return false
        }
        return true
    }

    public static generateUUID(){
        const uuid4 = uuidv4();
        return uuid4;
    }

    public static generateUserId(email){
      const uuid4 = uuidv4();;
      const uniqueUUID = `${email}-${uuid4}`;
      return uniqueUUID;
  }

    public static isValidBoolInput(input){
        if(input===true || input===false)return true
        else return false
    }



    public static hashPassword(password) {
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(password, salt);
        return hashedPassword;
    }

    public static checkPassword(password, hashedPassword) {
        return bcrypt.compareSync(password, hashedPassword);
      }

    public static isTokenExpiry(token){
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        try {
            const decoded = jwt.verify(token, jwtSecretKey);
            const { exp } = decoded;
          
            if (Date.now() >= exp * 1000) {
                 // token has expired
                return true
            } else {
              // token is still valid
              return false
            }
          } catch (err) {
            // error occurred while verifying token
            throw err
          }
    }


    public static  validateName(name) {
        const nameRegex = /^[a-zA-Z\s]+$/;
        return nameRegex.test(name);
      }

    public static formatUserId(userId: string): `${string}-${string}-${string}-${string}-${string}` {
        // Split the userId into five parts using a hyphen as the delimiter
        const parts: string[] = userId.split('-');
      
        // Ensure that the userId has exactly five parts
        if (parts.length !== 5) {
          throw new Error('Invalid userId format');
        }
      
        // Return the formatted userId
        return `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}-${parts[4]}`;
      }

}
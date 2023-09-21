export const user = (sequelize, Sequelize) => {
    const User = sequelize.define("user_details", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique:true,
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        primaryKey: true,
        unique:true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password:{
        type: Sequelize.STRING,
        allowNull: false,
      },
      isTiedToInsurance:{
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      phoneNumber:{
        type: Sequelize.INTEGER, 
      },
      countryCode:{
        type: Sequelize.INTEGER,
      },
      externalUserId:{
        type: Sequelize.STRING,
      },
      gender:{
        type: Sequelize.ENUM('MALE', 'FEMALE', 'WOULD NOT LIKE TO REVEAL'),
      },
      timeZone:{
        type: Sequelize.STRING,
      },
      status:{
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
      },
      isFirstLogin:{
        type: Sequelize.BOOLEAN
      },
      isEmailVerified:{
        type:  Sequelize.BOOLEAN
      },
      isDeleted:{
        type:  Sequelize.BOOLEAN
      },
      dob:{
        type: Sequelize.DATE(6),
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        timezone: true
      },
      createdAt:{
        type: Sequelize.DATE(6),
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
        timezone: true
      },
      updatedAt:{
        type: Sequelize.DATE(6),
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
        timezone: true
      }
    },
    {
      initialAutoIncrement: 10000,
    }
    );
    
    return User;
  };
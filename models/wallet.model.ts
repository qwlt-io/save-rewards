export const wallet = (sequelize, Sequelize) => {
    const Wallet = sequelize.define("wallet", {
      walletId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model:'wallet_masters',
          key: 'walletId',
        }
      },
      coinType:{
        type: Sequelize.ENUM('QWLT', 'SILK'),
        primaryKey: true,
        allowNull: false,
      },  
      activePoints:{
        type: Sequelize.INTEGER, 
      },
      expiredPoints:{
        type: Sequelize.INTEGER, 
      },
      earnedPoints:{
        type: Sequelize.INTEGER, 
      },
      usedPoints:{
        type: Sequelize.INTEGER, 
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
      return Wallet;
  };
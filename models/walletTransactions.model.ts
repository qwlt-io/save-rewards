export const walletTransactions = (sequelize, Sequelize) => {
    const WalletTransactions = sequelize.define("wallet_transactions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        unique:true,
        primaryKey: true,
        allowNull: false,
      },
      walletId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model:'wallet_masters',
          key: 'walletId',
          type: Sequelize.UUID
        }
      },
      txnType:{
        type: Sequelize.ENUM("SPENT", "EARNED"),
      },     
      rewardPoints:{
        type: Sequelize.INTEGER, 
      }, 
      coinType:{
        type: Sequelize.ENUM("QWLT", "SILK"),
      },   
      rewardTypeId: {
        type: Sequelize.STRING,
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
    }
    );
      return WalletTransactions;
  };
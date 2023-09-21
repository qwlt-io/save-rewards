import Cassandra from "./cassandra";
import CommonUtils from "../utils/common";
import { IAddOrUpdateRewardInput } from "../utils/interfaces";
import { REWARD_TYPE } from "../utils/constants";

const wallet = require("../controllers/wallet-controller");
const user = require("../controllers/user-controller");

const checkIfUserExists = async (userId) => {
  const verifyIfUserExistsResponse = await user.ifUserIdExists({
    userId: userId,
  });

  if (!verifyIfUserExistsResponse) {
    return {
      errorCode: 500,
      message: "Failed to update",
      errorMessage: "Failed to update",
    };
  }

  if (verifyIfUserExistsResponse?.errorCode) {
    return {
      errorCode: verifyIfUserExistsResponse?.errorCode,
      message: verifyIfUserExistsResponse?.message,
      errorMessage: verifyIfUserExistsResponse?.errorMessage,
    };
  }

  return { message: "CONTINUE" };
};

const errorHandlingForFailedDbOperation = async (dbResponse) => {
  if (!dbResponse) {
    return {
      errorCode: 500,
      message: "Operation Failed",
      errorMessage: "Operation Failed",
    };
  }

  if (dbResponse?.errorCode) {
    return {
      errorCode: dbResponse?.errorCode,
      message: dbResponse?.message,
      errorMessage: dbResponse?.errorMessage,
    };
  }

  return { message: "CONTINUE" };
};

export class WalletService {
  static cassandra = new Cassandra();

  //Method to login for a created user
  public static async addOrUpdateReward(
    addOrUpdateRewardInput: IAddOrUpdateRewardInput
  ): Promise<{
    errorCode?: number;
    errorMessage?: string;
    message?: string;
    status?: number;
  }> {
    //QUESTION TO BE ASKED: From Where will we get the reward_id

    console.log("addOrUpdateRewardInput:", addOrUpdateRewardInput);

    //check if a user exists in the db
    let ifUserExistsResponse = await checkIfUserExists(
      addOrUpdateRewardInput?.userId
    );
    if (ifUserExistsResponse?.message !== "CONTINUE")
      return ifUserExistsResponse;
    try {
      let walletId;

      //Check if the wallet exists in the walletMaster Table
      const verifyIfWalletExistsResponse = await wallet.ifWalletExists({
        userId: addOrUpdateRewardInput?.userId,
      });

      //If wallet does not exits for the user, create an entry in the walletMaster table
      if (!verifyIfWalletExistsResponse) {
        const createEntryInWalletMasterResponse =
          await wallet.createEntryInWalletMaster({
            userId: addOrUpdateRewardInput?.userId,
          });
        walletId = createEntryInWalletMasterResponse?.dataValues?.walletId;

        //db transaction Error Handling
        let errorHandlingResponse = await errorHandlingForFailedDbOperation(
          createEntryInWalletMasterResponse
        );
        if (errorHandlingResponse?.message !== "CONTINUE")
          return errorHandlingResponse;

        //Create an entry in the wallet table with 0 as values
        //CHANGE NEEDED HERE FOR SILK

        const createQwltEntryInWalletResponse =
          await wallet.createEntryInWallet({
            walletId: walletId,
            activePoints: 0,
            expiredPoints: 0,
            earnedPoints: 0,
            usedPoints: 0,
            coinType: "QWLT" as "QWLT",
          });

        //TOD: Error handling
        const createSilkEntryInWalletResponse =
          await wallet.createEntryInWallet({
            walletId: walletId,
            activePoints: 0,
            expiredPoints: 0,
            earnedPoints: 0,
            usedPoints: 0,
            coinType: "SILK" as "SILK",
          });

        //db transaction Error Handling
        let errorHandlingResponseForWallet =
          await errorHandlingForFailedDbOperation(
            createQwltEntryInWalletResponse
          );
        if (errorHandlingResponseForWallet?.message !== "CONTINUE")
          return errorHandlingResponseForWallet;
      } else {
        //In case the user exists update the walletId with the one that is fetched from db
        walletId = verifyIfWalletExistsResponse?.dataValues?.walletId;
      }

      //GEt the wallet entry and update the points in it on the basis f earned or spent
      const walletResponse = await wallet.getWalletEntry({
        walletId: walletId,
        coinType: addOrUpdateRewardInput?.coinType,
      });
      //CHANGE NEEDED HERE FOR SILK

      if (addOrUpdateRewardInput?.type === REWARD_TYPE.EARNED) {
        const walletUpdateResponse = await wallet.updateWallet({
          walletId: walletId,
          coinType: addOrUpdateRewardInput?.coinType,
          earnedPoints:
            walletResponse[0]?.dataValues?.earnedPoints +
            addOrUpdateRewardInput?.points,
          activePoints:
            walletResponse[0]?.dataValues?.activePoints +
            addOrUpdateRewardInput?.points,
        });

        //db transaction Error Handling
        let errorHandlingResponse = await errorHandlingForFailedDbOperation(
          walletUpdateResponse
        );
        if (errorHandlingResponse?.message !== "CONTINUE")
          return errorHandlingResponse;
      } else if (addOrUpdateRewardInput?.type === REWARD_TYPE.SPENT) {
        //Handles the case when the user wants to spend more than what he has
        if (
          walletResponse[0]?.dataValues?.activePoints -
            addOrUpdateRewardInput?.points <
          0
        ) {
          return {
            errorCode: 403,
            message: "Not enough points left to spend",
            errorMessage: "Not enough points left to spend",
          };
        }

        const walletUpdateResponse = await wallet.updateWallet({
          walletId: walletId,
          coinType: addOrUpdateRewardInput?.coinType,
          usedPoints:
            walletResponse[0]?.dataValues?.usedPoints +
            addOrUpdateRewardInput?.points,
          activePoints:
            walletResponse[0]?.dataValues?.activePoints -
            addOrUpdateRewardInput?.points,
        });

        //db transaction Error Handling
        let errorHandlingResponse = await errorHandlingForFailedDbOperation(
          walletUpdateResponse
        );
        if (errorHandlingResponse?.message !== "CONTINUE")
          return errorHandlingResponse;
      }

      const walletTransactionInput = {
        id: CommonUtils.generateUUID(),
        userId: addOrUpdateRewardInput?.userId,
        walletId,
        txnType: addOrUpdateRewardInput?.type,
        rewardPoints: addOrUpdateRewardInput.points,
        coinType: addOrUpdateRewardInput.coinType,
        rewardTypeId: 1,
        createdAt: new Date().getTime(),
        updatedAt: new Date().getTime(),
      };

      let walletTransaction =
        await this.cassandra.executeInsertQueryForWalletTransactions(
          walletTransactionInput
        );

      return { status: 200, message: "Wallet Successfully updated" };
    } catch (error) {
      console.log("Error:", error);
      return {
        errorCode: 500,
        message: "Failed to update",
        errorMessage: `Error Occured ${error}`,
      };
    } finally {
        this.cassandra.closeCassandraConnection();
    }
  }
}

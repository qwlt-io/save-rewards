import { timestamp, uuid } from "aws-sdk/clients/customerprofiles";


export interface IAddOrUpdateRewardInput {
    userId: uuid,
    points: number,
    type: string,
    coinType: string
  }
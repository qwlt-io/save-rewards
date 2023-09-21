const AWS = require('aws-sdk');
const axios = require('axios');
import { WalletService } from '../modules/wallet-module'
import { COIN_TYPE, METRIC_TYPE, REWARD_TYPE } from '../utils/constants';

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION // Set the appropriate region
  }); // Set the appropriate region

let sqs = new AWS.SQS();
const queueUrl = process.env.AWS_SQS_URL;

//Put data into the queue through an api call
export async function putRecordToQueue(data){

  const message = {
    userId: data.userId,
    data: data,
  };
  
  const messageBody = JSON.stringify(message);

  const params = {
    MessageBody: messageBody,
    QueueUrl: queueUrl,
    MessageGroupId: data.userId,
    MessageDeduplicationId: Date.now().toString(),
  };

  return new Promise((resolve, reject) => {
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        console.error('Error sending message to SQS:', err);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

}


//Fetched data from the queue periodically, process it, generate the reward and save the reward in db
export async function fetchDataFromQueueAndUpdateRewards(event) {

  try{
    console.log(`inside fetch data ${process.env.SQS_QUEUE_WAIT_TIME_SECONDS}`)

    const params = {
      QueueUrl: process.env.AWS_SQS_URL,
      MaxNumberOfMessages: 10, // Maximum number of messages to retrieve in each fetch
      AttributeNames: ['All'],
      MessageAttributeNames: ['All'],
      WaitTimeSeconds: process.env.SQS_QUEUE_WAIT_TIME_SECONDS,
      ReceiveRequestAttemptId: Date.now().toString(), // Unique identifier for each receive request
    };
  
    return sqs.receiveMessage(params, async(err, data) => {
      if (err) {
        console.error('Error receiving messages from SQS:', err);
      } else {
        console.log('data.Messages',data)
        const messages = data.Messages;
        // console.log(messages);
        if (messages && messages.length > 0) {
          // Sort the messages by message ID to maintain FIFO ordering
          messages.sort((a, b) => {
            return parseInt(a.MessageId) - parseInt(b.MessageId);
          });
  
          for(let message of messages)
          {
            // Retrieve and process the message body
            const messageBody = message.Body;
            console.log('messageBody',messageBody)
            // Parse the message body as JSON
            let messageData;
            try {
              messageData = JSON.parse(messageBody);
              messageData.processType = messageBody?.metricType
            } catch (error) {
              console.error('Error parsing message:', error);
              continue;
            }
            let points = 0

            if(event?.metricType == METRIC_TYPE.STEP_COUNT){
              let stepCount = messageBody?.metricData?.stepCount
              if(stepCount > 0){
                points = stepCount
              }
            }else{
                if(event?.metricType === METRIC_TYPE.GPS){
                  data = {
                    metricType: METRIC_TYPE.GPS
                  }
                }else if(event?.metricType === METRIC_TYPE.SCREEN_TIME){
                  data = {
                    metricType: METRIC_TYPE.SCREEN_TIME
                  }
                }
                //Calculate rewards from the lambda function
                const response = await axios.post(process.env.AWS_LAMBDA_URL, data);
      
                if(!response){
                  console.log("Something went wrong with the lambda")
                  continue;
                }

                console.log("Lamda Response:", response.data)
                if(response?.data){
                  if(response?.data?.body){
                    if(response?.data?.body?.rewards){
                      points = response?.data?.body?.rewards
                    }else{
                      if(typeof response?.data?.body === 'string'){
                        let rewardsJSON = JSON.parse(response?.data?.body)
                        points = rewardsJSON?.rewards
                      }
                    }
                  }
                }
              }

              let userId = messageData?.data?.userId

              const updateRewardsInput = {
                userId: userId,
                points,
                type: REWARD_TYPE.EARNED,
                coinType: COIN_TYPE.QWLT
              }
    
              if(!updateRewardsInput.points){
                await deleteMessage(message.ReceiptHandle);
                continue;
              }
    
              const { errorCode } = await WalletService.addOrUpdateReward(updateRewardsInput)
    
              //TODO :: Add logic to move it push notifications
              if(errorCode){
                console.log("errorCode:", errorCode)
              }    
            
              // Delete the processed message from the queue
              await deleteMessage(message.ReceiptHandle);
          }
          process.exit(0);
        } else {
          console.log('No messages available in the queue, like nothing');
          process.exit(0);
        }
      }
  
      return true;
    })
  }catch(err){
    console.log(err)
  }
  
}

async function deleteMessage(receiptHandle) {
  const deleteParams = {
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  };

  console.log('deleteParams', JSON.stringify(deleteParams))

  sqs.deleteMessage(deleteParams, (err) => {
    if (err) {
      console.error('Error deleting message from SQS:', err);
    } else {
      console.log('Message deleted from the queue.');
      return true;
    }
  });
}



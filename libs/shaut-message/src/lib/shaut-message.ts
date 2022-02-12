import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { ShautMessage, ShautService } from '@shauter/core';
import {
  DynamodbShautMessageService,
  DynamodbShautUserService,
} from './shaut-services';

const messageService = new DynamodbShautMessageService();
const userService = new DynamodbShautUserService();
const shautService = new ShautService(messageService, userService);

export const handler = async (
  message: ShautMessage
): Promise<APIGatewayProxyResultV2> => {
  try {
    await shautService.shautMessage(message);
    return {
      statusCode: 200,
      body: JSON.stringify(message),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify(err),
    };
  }
};

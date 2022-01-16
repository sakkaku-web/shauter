import { APIGatewayEvent, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ShautMessage, ShautService } from '@shauter/core';
import {
  DynamodbShautMessageService,
  DynamodbShautUserService,
} from './shaut-services';

const messageService = new DynamodbShautMessageService();
const userService = new DynamodbShautUserService();
const shautService = new ShautService(messageService, userService);

export const handler = async ({
  body,
}: APIGatewayEvent): Promise<APIGatewayProxyResultV2> => {
  const message: ShautMessage = JSON.parse(body);

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

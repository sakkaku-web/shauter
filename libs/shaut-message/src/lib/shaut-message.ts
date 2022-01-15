import { APIGatewayEvent } from 'aws-lambda';
import { ShautMessage, ShautService } from '@shauter/core';
import {
  DynamodbShautMessageService,
  DynamodbShautUserService,
} from './shaut-services';

const messageService = new DynamodbShautMessageService();
const userService = new DynamodbShautUserService();
const shautService = new ShautService(messageService, userService);

export const handler = async ({ body }: APIGatewayEvent) => {
  const message: ShautMessage = JSON.parse(body);

  try {
    shautService.shautMessage(message);
  } catch (err) {
    console.log(err);
    return err;
  }
};

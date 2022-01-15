import {
  Coordinate,
  ShautMessage,
  ShautMessageService,
  ShautUser,
  ShautUserService,
} from '@shauter/core';
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  BatchGetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: 'eu-central-1',
});

export class DynamodbShautMessageService implements ShautMessageService {
  async sendMessageToUsers(message: ShautMessage, users: ShautUser[]) {
    const response = await client.send(
      new QueryCommand({
        TableName: ShautMessageTable,
        KeyConditionExpression: `${ShautMessageColumn.REGION} IN (:regions)`,
        ExpressionAttributeValues: {
          ':regions': { SS: ['1'] },
        },
      })
    );
    console.log(message, users);
  }
}

export class DynamodbShautUserService implements ShautUserService {
  async getUsersForRegions(regions: Coordinate[]): Promise<ShautUser[]> {
    return [];
  }
}

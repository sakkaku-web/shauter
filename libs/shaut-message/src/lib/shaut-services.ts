import {
  Coordinate,
  ShautMessage,
  ShautMessageService,
  ShautUser,
  ShautUserService,
} from '@shauter/core';
import {
  DynamoDBClient,
  BatchWriteItemCommand,
  WriteRequest,
  QueryCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  ShautMessageColumn,
  ShautMessageTable,
  ShautUserColumn,
  ShautUserTable,
} from '@shauter/aws-shared';

const client = new DynamoDBClient({
  region: 'eu-central-1',
});

function coordinatesToRegion({ lat, long }: Coordinate): string {
  return `${lat};${long}`;
}

function regionToCoordinates(regionId: string): Coordinate {
  const split = regionId.split(';');
  return {
    lat: parseInt(split[0], 10),
    long: parseInt(split[1], 10),
  };
}

export class DynamodbShautMessageService implements ShautMessageService {
  async sendMessageToUsers(message: ShautMessage, users: ShautUser[]) {
    const created = new Date();
    const expires = created.setMinutes(created.getMinutes() + 1);

    const requests: WriteRequest[] = users.map((u) => ({
      PutRequest: {
        Item: {
          [ShautMessageColumn.USER_ID]: { S: u.id },
          [ShautMessageColumn.MESSAGE]: { S: message.text },
          [ShautMessageColumn.CREATED]: { N: `${created.getTime()}` },
          [ShautMessageColumn.EXPIRES]: { N: `${expires}` },
        },
      },
    }));

    const response = await client.send(
      new BatchWriteItemCommand({
        RequestItems: {
          [ShautMessageTable]: requests,
        },
      })
    );

    console.log('Saved', response.UnprocessedItems);
  }
}

export class DynamodbShautUserService implements ShautUserService {
  async getUsersForRegions(regions: Coordinate[]): Promise<ShautUser[]> {
    const query = new QueryCommand({
      TableName: ShautUserTable,
      KeyConditionExpression: `${ShautUserColumn.REGION} IN :regions`,
      ExpressionAttributeValues: {
        ':regions': { SS: ['1;1'] },
      },
    });

    const response = await client.send(query);
    return response.Items.map((i) => ({
      id: i[ShautUserColumn.USER_ID].S,
      region: regionToCoordinates(i[ShautUserColumn.REGION].S),
    }));
  }

  async updateUser(user: ShautUser) {
    const putRequest = new PutItemCommand({
      TableName: ShautUserTable,
      Item: {
        [ShautUserColumn.REGION]: { S: coordinatesToRegion(user.region) },
        [ShautUserColumn.USER_ID]: { S: user.id },
      },
    });

    const response = await client.send(putRequest);
    console.log(response.Attributes);
  }
}

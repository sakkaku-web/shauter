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
  BatchGetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { ShautUserColumn, ShautUserTable } from '@shauter/aws-shared';

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
          [ShautUserColumn.USER_ID]: { S: u.id },
          [ShautUserColumn.DATA_ID]: { S: `MESSAGE_${created.toISOString()}` },
          [ShautUserColumn.MESSAGE]: { S: message.text },
          [ShautUserColumn.CREATED]: { N: `${created.getTime()}` },
          [ShautUserColumn.EXPIRES]: { N: `${expires}` },
        },
      },
    }));

    const response = await client.send(
      new BatchWriteItemCommand({
        RequestItems: {
          [ShautUserTable]: requests,
        },
      })
    );

    // TODO: handle unprocessed
    console.log('Saved', response.UnprocessedItems);
  }
}

export class DynamodbShautUserService implements ShautUserService {
  async getUsersForRegions(regions: Coordinate[]): Promise<ShautUser[]> {
    const regionIds = regions.map((coor) => ({
      [ShautUserColumn.REGION]: { S: coordinatesToRegion(coor) },
    }));
    const query = new BatchGetItemCommand({
      RequestItems: {
        [ShautUserTable]: {
          Keys: regionIds,
        },
      },
    });

    const response = await client.send(query);
    // TODO: handle unprocessed

    return response.Responses[ShautUserTable].map((i) => {
      return i[ShautUserColumn.USER_ID].SS.map((u) => ({
        id: u,
        region: regionToCoordinates(i[ShautUserColumn.REGION].S),
      }));
    }).reduce((prev, curr) => prev.concat(curr), []);
  }

  async updateUser(user: ShautUser) {
    const putRequest = new PutItemCommand({
      TableName: ShautUserTable,
      Item: {
        [ShautUserColumn.USER_ID]: { S: user.id },
        [ShautUserColumn.DATA_ID]: { S: 'REGION_DATA' },
        [ShautUserColumn.REGION]: { S: coordinatesToRegion(user.region) },
      },
    });

    const response = await client.send(putRequest);
    console.log(response.Attributes);
  }
}

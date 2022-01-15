import { APIGatewayEvent } from 'aws-lambda';
import { RegionService, ShautMessage } from '@shauter/core';
import { ShautMessageTable, ShautMessageColumn } from '@shauter/aws-shared';
import {
  DynamodbShautMessageService,
  DynamodbShautUserService,
} from './shaut-services';

const regionService = new RegionService({
  lat: 90,
  long: 180,
  latDividor: 900,
  longDividor: 1800,
});
const messageService = new DynamodbShautMessageService();
const userService = new DynamodbShautUserService();

export const handler = async ({ body }: APIGatewayEvent) => {
  const message: ShautMessage = JSON.parse(body);

  try {
    const response = await client.send(
      new QueryCommand({
        TableName: ShautMessageTable,
        KeyConditionExpression: `${ShautMessageColumn.REGION} IN (:regions)`,
        ExpressionAttributeValues: {
          ':regions': { SS: ['1'] },
        },
      })
    );

    // const ret = await axios(url);
    response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'hello world',
        // location: ret.data.trim()
      }),
    };
  } catch (err) {
    console.log(err);
    return err;
  }
};

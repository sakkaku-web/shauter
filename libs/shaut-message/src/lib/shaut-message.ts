import { APIGatewayEvent } from 'aws-lambda';
import { ShautMessage } from '@shauter/core';
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  BatchGetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { ShautMessageTable, ShautMessageColumn } from '@shauter/aws-shared';

const client = new DynamoDBClient({
  region: 'eu-central-1',
});

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

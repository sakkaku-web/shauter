import * as cdk from '@aws-cdk/core';
import { HttpApi, HttpMethod, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { join } from 'path';
import { ShautMessageTable, ShautMessageColumn } from '@shauter/aws-shared';

export class AppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new HttpApi(this, 'commissionApi', {
      corsPreflight: {
        allowOrigins: [
          'http://localhost:4200',
          'https://sakkaku-web.github.io',
        ],
        allowHeaders: ['Authorization'],
        allowMethods: [CorsHttpMethod.ANY],
        allowCredentials: true,
      },
    });

    const table = new Table(scope, 'shautMessage', {
      tableName: ShautMessageTable,
      timeToLiveAttribute: 'expires',
      partitionKey: {
        name: ShautMessageColumn.USER_ID,
        type: AttributeType.STRING,
      },
      sortKey: {
        name: ShautMessageColumn.MESSAGE_ID,
        type: AttributeType.STRING,
      },
    });

    table.addGlobalSecondaryIndex({
      indexName: 'regions',
      partitionKey: {
        name: ShautMessageColumn.REGION,
        type: AttributeType.STRING,
      },
      sortKey: {
        name: ShautMessageColumn.USER_ID,
        type: AttributeType.STRING,
      },
    });

    const libsPath = '../../dist/libs';
    const shautMessageFunction = new Function(scope, 'shautMessageFunction', {
      functionName: 'shautMessageFunction',
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset(join(libsPath, 'shaut-message')),
      handler: 'shaut-message.getHandler',
      logRetention: RetentionDays.ONE_MONTH,
    });

    table.grantWriteData(shautMessageFunction);

    api.addRoutes({
      path: '/shaut',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        'shautMessage',
        shautMessageFunction
      ),
    });
  }
}

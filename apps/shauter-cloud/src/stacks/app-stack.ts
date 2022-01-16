import * as cdk from '@aws-cdk/core';
import { HttpApi, HttpMethod, CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import { AttributeType, Table } from '@aws-cdk/aws-dynamodb';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { UserPool, UserPoolIdentityProviderGoogle } from '@aws-cdk/aws-cognito';
import { join } from 'path';
import {
  ShautMessageTable,
  ShautMessageColumn,
  ShautUserTable,
  ShautUserColumn,
} from '../../../../libs/aws-shared/src';

export class AppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new HttpApi(this, 'shautApi', {
      corsPreflight: {
        allowOrigins: [
          'https://sakkaku-web.github.io',
        ],
        allowHeaders: ['Authorization'],
        allowMethods: [CorsHttpMethod.ANY],
        allowCredentials: true,
      },
    });

    const messageTable = new Table(this, 'shautMessage', {
      tableName: ShautMessageTable,
      timeToLiveAttribute: ShautMessageColumn.EXPIRES,
      partitionKey: {
        name: ShautMessageColumn.USER_ID,
        type: AttributeType.STRING,
      },
      sortKey: {
        name: ShautMessageColumn.MESSAGE,
        type: AttributeType.STRING,
      },
    });

    const userTable = new Table(this, 'shautUser', {
      tableName: ShautUserTable,
      partitionKey: {
        name: ShautUserColumn.REGION_ID,
        type: AttributeType.STRING,
      },
    });

    const libsPath = '../../dist/libs';
    const shautMessageFunction = new Function(this, 'shautMessageFunction', {
      functionName: 'shautMessageFunction',
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset(join(libsPath, 'shaut-message')),
      handler: 'shaut-message.handler',
      logRetention: RetentionDays.ONE_MONTH,
    });

    messageTable.grantWriteData(shautMessageFunction);
    userTable.grantReadData(shautMessageFunction);

    api.addRoutes({
      path: '/shaut',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        'shautMessage',
        shautMessageFunction
      ),
    });

    const googleUserPool = new UserPool(this, 'googleIdentityUserPool');
    const googleProvider = new UserPoolIdentityProviderGoogle(this, 'googleIdentityProvider', {
      clientId: process.env.GOOGLE_CLIENT,
      clientSecret: process.env.GOOGLE_SECRET,
      userPool: googleUserPool,
    });

    new cdk.CfnOutput(this, 'apiUrl', { value: api.url });
  }
}

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as iam from 'aws-cdk-lib/aws-iam';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iot from 'aws-cdk-lib/aws-iot';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table to contain robot statuses
    const robotTable = new ddb.Table(this, 'RobotDDBTable', {
      tableName: "RobotStatusTable",
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'name',
        type: ddb.AttributeType.STRING,
      },
    });

    // Build Python Lambda function for updates
    const updateFunctionPy = new lambda.Function(this, 'RobotStatusLambdaFunctionPy', {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'handler.lambda_handler',
      code: lambda.Code.fromAsset('./handlers/python-update-status'),
      architecture: lambda.Architecture.ARM_64,
      environment: {
        "TABLE_NAME": robotTable.tableName,
      },
    });

    // Modify Lambda permission to allow DDB updating
    if (updateFunctionPy.role) {
      robotTable.grantWriteData(updateFunctionPy.role);
    }

    // Repeat for the Rust version
    const updateFunctionRs = new lambda.Function(this, 'RobotStatusLambdaFunctionRs', {
      runtime: lambda.Runtime.PROVIDED_AL2023,
      handler: 'bootstrap',
      code: lambda.Code.fromAsset('./handlers/rust-update-status/target/lambda/rust-update-status/bootstrap.zip'),
      architecture: lambda.Architecture.ARM_64,
      environment: {
        "TABLE_NAME": robotTable.tableName,
      },
    });
    if (updateFunctionRs.role) {
      robotTable.grantWriteData(updateFunctionRs.role);
    }

    // Create IoT rule per Lambda function to invoke
    const targets = [{ name: "RobotIngestPy", func: updateFunctionPy }, { name: "RobotIngestRs", func: updateFunctionRs }];
    for (const target of targets) {
      const lambdaAction: iot.CfnTopicRule.LambdaActionProperty = {
        functionArn: target.func.functionArn,
      };
      const action: iot.CfnTopicRule.ActionProperty = {
        lambda: lambdaAction,
      };
      const rule = new iot.CfnTopicRule(this, `${target.name}Rule`, {
        topicRulePayload: {
          sql: `SELECT * FROM 'robots/+/status'`,
          actions: [action],
        },
        ruleName: target.name,
      });
      target.func.addPermission(`${target.name}LambdaPermission`, {
        principal: new iam.ServicePrincipal("iot.amazonaws.com"),
        sourceArn: rule.attrArn,
        action: "lambda:InvokeFunction",
      });
    }
  }
}

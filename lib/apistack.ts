import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';

interface AuthFunctions {
  googleLambda: NodejsFunction
  callbackLambda: NodejsFunction
  registerLambda: NodejsFunction
  resendLambda: NodejsFunction
  confirmLambda: NodejsFunction
  loginLambda: NodejsFunction
}

export class APIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps, authFunctions: AuthFunctions) {
    super(scope, id, props);

    const api = new RestApi(this, "FinalCasinoApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS
    },
    })

    const googleRoute = api.root.addResource("google")
    googleRoute.addMethod("GET", new LambdaIntegration(authFunctions.googleLambda))

    const callbackRoute = api.root.addResource("callback")
    callbackRoute.addMethod("POST", new LambdaIntegration(authFunctions.callbackLambda))

    const registerRoute = api.root.addResource("register")
    registerRoute.addMethod("POST", new LambdaIntegration(authFunctions.registerLambda))

    const resendRoute = api.root.addResource("resend")
    resendRoute.addMethod("POST", new LambdaIntegration(authFunctions.resendLambda))

    const confirmRoute = api.root.addResource("confirm")
    confirmRoute.addMethod("POST", new LambdaIntegration(authFunctions.confirmLambda))

    const loginRoute = api.root.addResource("login")
    loginRoute.addMethod("POST", new LambdaIntegration(authFunctions.loginLambda))

  }
}

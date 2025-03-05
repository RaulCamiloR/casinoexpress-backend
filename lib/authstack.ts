import * as cdk from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { join } from 'path';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { StageVariables } from '../interfaces/stageVariables';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';

export class AUTHStack extends cdk.Stack {

    public googleLambda: NodejsFunction
    public callbackLambda: NodejsFunction
    public registerLambda: NodejsFunction
    public resendLambda: NodejsFunction
    public confirmLambda: NodejsFunction
    public loginLambda: NodejsFunction

    constructor(scope: Construct, id: string, props: cdk.StackProps, stageVariables: StageVariables) {
        super(scope, id, props);

        //===================================================================================

        const userPool = new UserPool(this, "FinalCasinoUserPool", {
            selfSignUpEnabled: true,
            signInAliases: {
                email: true
            },
            autoVerify: {
                email: true
            },
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        })


        const domain = userPool.addDomain("FinalCasinoDomain", {
            cognitoDomain: {
                domainPrefix: stageVariables.domainPrefix
            }
        })

        //===================================================================================
        const secret = Secret.fromSecretAttributes(this, "FinalCasinoGoogleSecret", {
            secretCompleteArn: stageVariables.secretARNGoogle
        }).secretValue

        const provider = new cdk.aws_cognito.UserPoolIdentityProviderGoogle(this, 'FinalCasinoGoogleProvider', {
            clientId: stageVariables.googleClientId,
            clientSecretValue: secret,
            userPool,
            scopes: ["profile", "openid", "email"],
            attributeMapping: {
                email: cdk.aws_cognito.ProviderAttribute.GOOGLE_EMAIL, 
                givenName: cdk.aws_cognito.ProviderAttribute.GOOGLE_GIVEN_NAME, 
                familyName: cdk.aws_cognito.ProviderAttribute.GOOGLE_FAMILY_NAME, 
            }
          });
    
          userPool.registerIdentityProvider(provider)

        //===================================================================================
        const userPoolClient = new UserPoolClient(this, "FinalCasinoUserPoolClient", {
            userPool,
            generateSecret: false,
            supportedIdentityProviders: [
                cdk.aws_cognito.UserPoolClientIdentityProvider.GOOGLE
            ],
            authFlows: {
              userPassword: true
            },
            accessTokenValidity: cdk.Duration.hours(6), 
            idTokenValidity: cdk.Duration.hours(6),    
            refreshTokenValidity: cdk.Duration.days(30),
            oAuth: {
                flows: {
                  authorizationCodeGrant: true, 
                  implicitCodeGrant: false,
                },
                callbackUrls: [
                  stageVariables.redirectUrl,
                ],
            },
        })

        userPoolClient.node.addDependency(provider)

        //===================================================================================
        //            LAMBDAS
        //===================================================================================
        this.googleLambda = new NodejsFunction(this, "FinalGoogleL", {
            runtime: Runtime.NODEJS_LATEST,
            handler: "google",
            entry: (join(__dirname, "../lambdas/google.ts")),
            environment: {
                REDIRECT: stageVariables.redirectUrl,
                CLIENT_ID: userPoolClient.userPoolClientId,
                REGION: stageVariables.region,
                DOMAIN_NAME: domain.domainName,
                CORS_ORIGIN: stageVariables.corsOrigin
            }
        })
        //===================================================================================
        this.callbackLambda = new NodejsFunction(this, "FinalCallbackL", {
            runtime: Runtime.NODEJS_LATEST,
            handler: "callback",
            entry: (join(__dirname, "../lambdas/callback.ts")),
            environment: {
                REDIRECT: stageVariables.redirectUrl,
                CLIENT_ID: userPoolClient.userPoolClientId,
                REGION: stageVariables.region,
                DOMAIN_NAME: domain.domainName,
                USER_POOL_ID: userPool.userPoolId,
                ENDS_WITH: stageVariables.endsWith,
                CORS_ORIGIN: stageVariables.corsOrigin
            }
        })

        this.callbackLambda.addToRolePolicy(
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["cognito-idp:AdminDeleteUser"],
              resources: [userPool.userPoolArn],
            })
        );
        //===================================================================================
        this.registerLambda = new NodejsFunction(this, "FinalRegisterL", {
            runtime: Runtime.NODEJS_LATEST,
            handler: "register",
            entry: (join(__dirname, "../lambdas/register.ts")),
            environment: {
                CLIENT_ID: userPoolClient.userPoolClientId,
                CORS_ORIGIN: stageVariables.corsOrigin
            }
        })

        this.registerLambda.addToRolePolicy(
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["cognito-idp:SignUp"],
              resources: [userPool.userPoolArn], 
            })
        )
        //===================================================================================
        this.resendLambda = new NodejsFunction(this, "FinalResendL", {
            runtime: Runtime.NODEJS_LATEST,
            handler: "resend",
            entry: (join(__dirname, "../lambdas/resend.ts")),
            environment: {
                CLIENT_ID: userPoolClient.userPoolClientId,
                CORS_ORIGIN: stageVariables.corsOrigin
            }
        })

        this.resendLambda.addToRolePolicy(
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ["cognito-idp:ResendConfirmationCode"],
              resources: [userPool.userPoolArn]
            })
        )
        
        //===================================================================================
        this.confirmLambda = new NodejsFunction(this, "FinalConfirmL", {
            runtime: Runtime.NODEJS_LATEST,
            handler: "confirm",
            entry: (join(__dirname, "../lambdas/confirm.ts")),
            environment: {
                CLIENT_ID: userPoolClient.userPoolClientId,
                CORS_ORIGIN: stageVariables.corsOrigin
            }
        })

        this.confirmLambda.addToRolePolicy(
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ['cognito-idp:AdminConfirmSignUp'],
              resources: [userPool.userPoolArn], // ARN del User Pool
            })
        );
        //===================================================================================
        this.loginLambda = new NodejsFunction(this, "FinalLoginL", {
            runtime: Runtime.NODEJS_LATEST,
            handler: "login",
            entry: (join(__dirname, "../lambdas/login.ts")),
            environment: {
                CLIENT_ID: userPoolClient.userPoolClientId,
                CORS_ORIGIN: stageVariables.corsOrigin
            }
        })
        //===================================================================================
    }
}

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stage } from 'aws-cdk-lib';
import { AUTHStack } from '../lib/authstack';
import { APIStack } from '../lib/apistack';
import { StageVariables } from '../interfaces/stageVariables';

export class CEApp extends Stage {
  constructor(scope: Construct, id: string, props: cdk.StageProps, stageVariables: StageVariables) {
    super(scope, id, props);

    const auth = new AUTHStack(this, "CasinoFinalAuth", {}, {
      googleClientId: stageVariables.googleClientId, 
      secretARNGoogle: stageVariables.secretARNGoogle, 
      redirectUrl: stageVariables.redirectUrl,
      region: stageVariables.region,
      domainPrefix: stageVariables.domainPrefix,
      googleSecret: stageVariables.googleSecret,
      endsWith: stageVariables.endsWith,
      corsOrigin: stageVariables.corsOrigin
    })
    const api = new APIStack(this, "CasinoFinalApi", {}, {
        googleLambda: auth.googleLambda,
        callbackLambda: auth.callbackLambda,
        registerLambda: auth.registerLambda,
        resendLambda: auth.resendLambda,
        confirmLambda: auth.confirmLambda,
        loginLambda: auth.loginLambda
    })

  }
}
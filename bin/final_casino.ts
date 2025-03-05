import "dotenv/config"
import * as cdk from 'aws-cdk-lib';
import { CEApp } from '../stage/stage';

const app = new cdk.App();

// ==================================================================================
const googleClientId = process.env.GOOGLE_CLIENT_ID!
const googleSecret = process.env.GOOGLE_SECRET!
const secretARNGoogle = process.env.SECRET_ARN_GOOGLE!
const redirectUrl = process.env.REDIRECT_URL!
const domainPrefix = process.env.CE_DOMAIN!
const ceCors = process.env.CE_CORS!
const region = process.env.REGION!
const allowedEmail = process.env.ALLOWED_EMAIL!

const dev = new CEApp(app, "Dev", {}, {
    googleClientId, 
    googleSecret,
    secretARNGoogle, 
    redirectUrl, 
    region,
    domainPrefix,
    endsWith: allowedEmail,
    corsOrigin: ceCors
})

// ==================================================================================
const casinoGoogleClientId = process.env.CASINO_GOOGLE_CLIENT_ID!
const casinoGoogleSecret = process.env.CASINO_GOOGLE_SECRET!
const casinoSecretARN = process.env.CASINO_SECRET_ARN_GOOGLE!
const casinoExpDomain = process.env.CASINO_EXP_DOMAIN!
const casinoRedirectUrl = process.env.CASINO_REDIRECT_URL!
const casinoCors = process.env.CASINO_EXPRESS_CORS!
const casinoRegion = process.env.CASINO_EXPRESS_REGION!
const casinoAllowedEmail = process.env.CASINO_EXPRESS_ALLOWED_EMAIL!


const casinodev = new CEApp(app, "CasinoDev", {}, {
    googleClientId: casinoGoogleClientId, 
    googleSecret: casinoGoogleSecret,
    secretARNGoogle: casinoSecretARN, 
    redirectUrl: casinoRedirectUrl, 
    region: casinoRegion,
    domainPrefix: casinoExpDomain,
    endsWith: casinoAllowedEmail,
    corsOrigin: casinoCors
})
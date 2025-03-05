import * as jwt from 'jsonwebtoken';
import { parsear } from "../helpers/parser";
import { cognitoClient } from "../services/cognito";
import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";

export const login = async (event) => {
    
    const corsOrigin = process.env.CORS_ORIGIN!

    try {
        const body = parsear(event);
        const clientId = process.env.CLIENT_ID;
        

        const response = await cognitoClient.send(
            new InitiateAuthCommand({
                AuthFlow: "USER_PASSWORD_AUTH",
                ClientId: clientId,
                AuthParameters: {
                    PASSWORD: body.password,
                    USERNAME: body.email
                }
            })
        );

        if (!response.AuthenticationResult) {
            return {
                statusCode: 401,
                headers: {
                    "Access-Control-Allow-Origin": corsOrigin,
                },
                body: JSON.stringify({
                    ok: false,
                    message: "Invalid username or password",
                })
            };
        }

        const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;

        const decodedToken = jwt.decode(IdToken) as any;

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": corsOrigin,
            },
            body: JSON.stringify({
                ok: true,
                id_token: IdToken,
                access_token: AccessToken,
                refresh_token: RefreshToken,
                decodedToken
            })
        };
        
    } catch (error: any) {
        if (error.name === "NotAuthorizedException") {
            return {
                statusCode: 401,
                headers: {
                    "Access-Control-Allow-Origin": corsOrigin,
                },
                body: JSON.stringify({
                    ok: false,
                    message: "Invalid username or password",
                })
            };
        } else if (error.name === "UserNotFoundException") {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": corsOrigin,
                },
                body: JSON.stringify({
                    ok: false,
                    message: "User not found",
                })
            };
        } else {
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": corsOrigin,
                },
                body: JSON.stringify({
                    ok: false,
                    message: "Internal server error",
                    error: error.message
                })
            };
        }
    }
};

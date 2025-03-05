import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import { URLSearchParams } from 'url';
import { parsear } from '../helpers/parser';
import { cognitoClient } from '../services/cognito';
import { AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';

export const callback = async (event) => {

  const corsOrigin = process.env.CORS_ORIGIN!

  try {

    const clientId = process.env.CLIENT_ID!
    const redirectUri = process.env.REDIRECT! 
    const domain = process.env.DOMAIN_NAME! 
    const region = process.env.REGION! 
    const endsWith = process.env.ENDS_WITH!
    const userPoolId = process.env.USER_POOL_ID!
    
    const { code } = parsear(event)

    if (!code) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin, 
        },
        body: JSON.stringify({ ok: false, error: 'Código de autorización no proporcionado' }),
      };
    }

    if(!clientId || !redirectUri){
        return {
            statusCode: 400,
            headers: {
              "Access-Control-Allow-Origin": corsOrigin, 
            },
            body: JSON.stringify({ ok: false, error: 'No client Id or RedirectUrl' }),
          };
    }
    
    const tokenUrl = `https://${domain}.auth.${region}.amazoncognito.com/oauth2/token`;

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', clientId);
    params.append('code', code);
    params.append('redirect_uri', redirectUri);

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const decodedToken = jwt.decode(response.data.id_token) as any;

    const userEmail = decodedToken.email;
    const username = decodedToken["cognito:username"];

    if (!userEmail.endsWith(endsWith)) {
  
        const respo = await cognitoClient.send(
          new AdminDeleteUserCommand({
            Username: username,
            UserPoolId: userPoolId
          })
        )
  
        return {
          statusCode: 403,
          headers: {
            "Access-Control-Allow-Origin": corsOrigin, 
          },
          body: JSON.stringify({ 
            ok: false,
            error: 'Acceso denegado: dominio de email no permitido'
          }),
        };
      }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": corsOrigin, 
      },
      body: JSON.stringify({
        ok: true,
        id_token: response.data.id_token,
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        decodedToken
      }),
    };
  } catch (error) {
    console.error('Error en la Lambda de Callback:', error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": corsOrigin, 
      },
      body: JSON.stringify({
        ok: false, 
        error: 'Error al intercambiar el código por tokens',
        details: error
      }),
    };
  }
};
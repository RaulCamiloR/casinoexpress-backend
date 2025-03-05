import { parsear } from "../helpers/parser";
import { cognitoClient } from "../services/cognito";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";

export const register = async (event) => {
  
  const corsOrigin = process.env.CORS_ORIGIN!

  try {
    const body = parsear(event);
    const clientId = process.env.CLIENT_ID;
    

    const response = await cognitoClient.send(
      new SignUpCommand({
        ClientId: clientId,
        Username: body.email,
        Password: body.password,
      })
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": corsOrigin,
      },
      body: JSON.stringify({
        ok: true,
        response,
      }),
    };
  } catch (error: any) {
    if (error.name === "UsernameExistsException") {
      return {
        statusCode: 409,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
        },
        body: JSON.stringify({
          ok: false,
          message: "El usuario ya existe",
        }),
      };
    } else if (error.name === "InvalidPasswordException") {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
        },
        body: JSON.stringify({
          ok: false,
          message: "La contraseña no cumple con los requisitos",
        }),
      };
    } else if (error.name === "InvalidParameterException") {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
        },
        body: JSON.stringify({
          ok: false,
          message: "Parámetros inválidos",
        }),
      };
    } else {
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
        },
        body: JSON.stringify({
          ok: false,
          message: "Error interno del servidor",
          error: error.message,
        }),
      };
    }
  }
};

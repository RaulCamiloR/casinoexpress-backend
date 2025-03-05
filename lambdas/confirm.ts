import { ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { parsear } from "../helpers/parser";
import { cognitoClient } from "../services/cognito";

export const confirm = async (event) => {
  const corsOrigin = process.env.CORS_ORIGIN!;

  try {
    const body = parsear(event);
    const clientId = process.env.CLIENT_ID!;

    const response = await cognitoClient.send(
      new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: body.email,
        ConfirmationCode: body.code,
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
    if (error.name === "CodeMismatchException") {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
        },
        body: JSON.stringify({
          ok: false,
          message: "El código de confirmación es incorrecto",
        }),
      };
    } else if (error.name === "ExpiredCodeException") {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
        },
        body: JSON.stringify({
          ok: false,
          message: "El código de confirmación ha expirado",
        }),
      };
    } else if (error.name === "UserNotFoundException") {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
        },
        body: JSON.stringify({
          ok: false,
          message: "Usuario no encontrado",
        }),
      };
    } else if (error.name === "NotAuthorizedException") {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
        },
        body: JSON.stringify({
          ok: false,
          message: "El usuario ya se encuentra confirmado o no está autorizado",
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

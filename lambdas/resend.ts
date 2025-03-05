import { parsear } from "../helpers/parser";
import { cognitoClient } from "../services/cognito";
import { ResendConfirmationCodeCommand } from "@aws-sdk/client-cognito-identity-provider";

export const resend = async (event) => {
  const corsOrigin = process.env.CORS_ORIGIN!;

  try {
    const body = parsear(event);
    const clientId = process.env.CLIENT_ID;

    const response = await cognitoClient.send(
      new ResendConfirmationCodeCommand({
        ClientId: clientId,
        Username: body.email,
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
    if (error.name === "UserNotFoundException") {
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
    } else if (error.name === "LimitExceededException") {
      return {
        statusCode: 429,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
        },
        body: JSON.stringify({
          ok: false,
          message: "Se ha excedido el número de solicitudes. Inténtalo más tarde.",
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
    } else if (error.name === "NotAuthorizedException") {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
        },
        body: JSON.stringify({
          ok: false,
          message: "El usuario ya se encuentra confirmado o no está autorizado para esta acción",
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

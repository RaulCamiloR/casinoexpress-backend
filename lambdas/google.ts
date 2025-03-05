
export const google = async(event) => {

    const corsOrigin = process.env.CORS_ORIGIN!

    try {

        const domain = process.env.DOMAIN_NAME!
        const clientId = process.env.CLIENT_ID!
        const redirect = process.env.REDIRECT!
        const region = process.env.REGION!

        // Google directamente - Restringido - segura

        const authUrl =`https://${domain}.auth.${region}.amazoncognito.com/oauth2/authorize?client_id=${clientId}&response_type=code&scope=openid+profile+email&redirect_uri=${encodeURIComponent(redirect)}&identity_provider=Google`;


        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": corsOrigin, 
            },
            body: JSON.stringify({
                ok: true,
                authUrl
            })
        }
        
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": corsOrigin, 
            },
            body: JSON.stringify({
                ok: false, 
                error
            })
        }
    }
}
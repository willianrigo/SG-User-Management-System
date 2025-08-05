import { setGlobalOptions, logger } from "firebase-functions";
import * as admin from "firebase-admin";
import { IGeoData, IRequest, IUser } from "./types";
import { runWith } from "firebase-functions/v1";

setGlobalOptions({ maxInstances: 5 });
admin.initializeApp();

const registerRequestProcessing = async (req: IRequest): Promise<void> => {
    const { requesterUserId, status, errorCode, errorMessage } = req;

    const db = admin.database();
    const requestPath = `/requests/${req.requestId}`;

    await db.ref(requestPath).set({
        status,
        errorCode: errorCode || null,
        errorMessage: errorMessage || null,
        timestamp: Date.now(),
        requesterUserId,
    });
}

const updateUserGeoInfo = async ({ data, userId }: { data: IGeoData, userId: string }): Promise<void> => {

    logger.log(`Calling updateUserGeoInfo. User ID: ${userId}`)
    const db = admin.database();
    const userRef = db.ref(`/users/${userId}`);

    try {
        await userRef.update({
            geoData: data,
        });
    } catch (e) {
        logger.error(`Failed calling updateUserGeoInfo. Error: ${String(e)}`);
    }
};

const deleteUserEntry = async (userId: string) => {
    const db = admin.database();
    const userRef = db.ref(`/users/${userId}`);
    await userRef.remove();
}


export const fetchGeoDataOnCreate = runWith({
    secrets: ['OPENWEATHER_API_KEY']
  }).database.ref('/users/{uid}').onCreate(async (snapshot, context) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        logger.error("OpenWeather API key not found");
        return;
    }

    const requesterUserId = context.params.uid;
    const user: IUser = snapshot.val();
    const userId = snapshot.ref.key!;
    const requestId: string = user.lastRequestId;
    
    logger.log("Started execution for fetchGeoDataOnCreate");
    logger.log("User Data: ", JSON.stringify(user));

    if (!user.lastRequestId) {
        await deleteUserEntry(userId);
        return;
    }

    logger.log("Check Point 1");

    if (!user || !user.zip) {
        logger.log("Check Point 2");
        const errorMessage = `Request: ${user.lastRequestId} is missing one of the required fields: 'name', 'zip', 'email', 'lastRequestId'`;
        logger.warn(errorMessage);
        await registerRequestProcessing({
            requestId,
            requesterUserId,
            status: 'error',
            errorCode: 'INVALID_ZIP',
            errorMessage: errorMessage,
        });
        await deleteUserEntry(userId);
        logger.log("Check Point 3");
        return;
    } else {
        logger.log("Check Point 4");
        try {
            const zip = user.zip;
            const apiKey = process.env.OPENWEATHER_API_KEY;
            logger.log("OPENWEATHER KEY: ", apiKey);
            const geoUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&appid=${apiKey}`;
            logger.log("Check Point 5, geoUrl: ", geoUrl);
            const response = await fetch(geoUrl);
            logger.log("Check Point 6");
            if (!response.ok) {
            logger.log("Check Point 7");
            logger.log(`API response: ${response.status}`)
                // city not found - invalid zip code
                if (response.status === 404) {
                    const responseMessage = (await response.json()).message;
                    await registerRequestProcessing({
                        requesterUserId,
                        status: 'error',
                        errorCode: 'INVALID_ZIP',
                        errorMessage: responseMessage,
                        requestId,
                    });
                    await deleteUserEntry(userId);
                    return;

                    // Unauthorized - Invalid API Key
                } else if (response.status === 401) {
                    logger.log("Check Point 8");
                    await registerRequestProcessing({
                        requesterUserId,
                        status: 'error',
                        errorCode: 'INVALID_API_KEY',
                        requestId,
                    });
                    await deleteUserEntry(userId);
                    return;
                }
            } else {
                // Response was OK
                logger.log("Check Point 9");
                const data = await response.json();
                const { lat, lon } = data.coord;
                const { timezone, name: cityName } = data;
                await updateUserGeoInfo({
                    data: {
                        lat,
                        lon,
                        timezone,
                        cityName,
                    },
                    userId,
                })
            }
            await registerRequestProcessing({
                requesterUserId,
                requestId,
                status: "success"
            });
            return;
        } catch (e) {
            await registerRequestProcessing({
                requesterUserId,
                status: 'error',
                errorCode: 'GENERIC_ERROR',
                errorMessage: String(e),
                requestId,
            });
        }
    }
});


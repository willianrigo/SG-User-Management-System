import { setGlobalOptions, logger } from "firebase-functions";
import * as admin from "firebase-admin";
import { runWith } from "firebase-functions/v1";
import { IUser } from "./types";
import { processGeoEnrichment } from "./services/geoService";

setGlobalOptions({ maxInstances: 5 });
admin.initializeApp();

const handleGeoEnrichment = async (snapshot: any, context: any) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        logger.error("OpenWeather API key not found");
        return;
    }

    const requesterUserId = context.params.uid;
    const user: IUser = snapshot.val();
    const userId = snapshot.ref.key!;
    const requestId: string = user.lastRequestId;
    
    logger.log("Processing geo enrichment for user:", userId);
    
    await processGeoEnrichment(user, userId, requesterUserId, requestId, apiKey);
};

export const fetchGeoDataOnCreate = runWith({
    secrets: ['OPENWEATHER_API_KEY']
}).database.ref('/users/{uid}').onCreate(handleGeoEnrichment);

export const fetchGeoDataOnUpdate = runWith({
    secrets: ['OPENWEATHER_API_KEY']
}).database.ref('/users/{uid}').onUpdate(async (change, context) => {
    const beforeUser: IUser = change.before.val();
    const afterUser: IUser = change.after.val();
    
    // Only process if ZIP code changed or if there's a new request ID
    if (beforeUser.zip !== afterUser.zip || beforeUser.lastRequestId !== afterUser.lastRequestId) {
        await handleGeoEnrichment(change.after, context);
    }
});


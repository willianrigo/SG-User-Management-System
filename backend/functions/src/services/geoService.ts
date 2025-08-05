import { logger } from "firebase-functions";
import * as admin from "firebase-admin";
import { IGeoData, IUser } from "../types";
import { registerRequestProcessing, deleteUserEntry } from "./requestService";

export const updateUserGeoData = async (userId: string, geoData: IGeoData): Promise<void> => {
    logger.log(`Updating geo data for user: ${userId}`);
    const db = admin.database();
    const userRef = db.ref(`/users/${userId}`);

    try {
        await userRef.update({ geoData });
    } catch (error) {
        logger.error(`Failed to update geo data: ${String(error)}`);
        throw error;
    }
};

export const fetchGeoDataFromAPI = async (zip: string, apiKey: string): Promise<IGeoData> => {
    const geoUrl = `https://api.openweathermap.org/data/2.5/weather?zip=${zip}&appid=${apiKey}`;
    logger.log(`Fetching geo data from: ${geoUrl}`);
    
    const response = await fetch(geoUrl);
    
    if (!response.ok) {
        if (response.status === 404) {
            const responseData = await response.json();
            throw new Error(`Invalid ZIP code: ${responseData.message}`);
        } else if (response.status === 401) {
            throw new Error("Invalid API key");
        } else {
            throw new Error(`API request failed with status: ${response.status}`);
        }
    }

    const data = await response.json();
    const { lat, lon } = data.coord;
    const { timezone, name: cityName } = data;

    return { lat, lon, timezone, cityName };
};

export const processGeoEnrichment = async (
    user: IUser, 
    userId: string, 
    requesterUserId: string, 
    requestId: string,
    apiKey: string
): Promise<void> => {
    try {
        if (!user.lastRequestId) {
            await deleteUserEntry(userId);
            return;
        }

        if (!user || !user.zip || !user.name) {
            const errorMessage = `Missing required fields: name or zip`;
            logger.warn(errorMessage);
            
            await registerRequestProcessing({
                requestId,
                requesterUserId,
                status: 'error',
                errorCode: 'MISSING_REQ_ATTR',
                errorMessage,
            });
            
            await deleteUserEntry(userId);
            return;
        }

        const geoData = await fetchGeoDataFromAPI(user.zip, apiKey);
        await updateUserGeoData(userId, geoData);
        
        await registerRequestProcessing({
            requesterUserId,
            requestId,
            status: "success"
        });

    } catch (error) {
        const errorMessage = String(error);
        let errorCode: 'INVALID_ZIP' | 'INVALID_API_KEY' | 'GENERIC_ERROR' = 'GENERIC_ERROR';
        
        if (errorMessage.includes('Invalid ZIP code')) {
            errorCode = 'INVALID_ZIP';
        } else if (errorMessage.includes('Invalid API key')) {
            errorCode = 'INVALID_API_KEY';
        }

        await registerRequestProcessing({
            requesterUserId,
            status: 'error',
            errorCode,
            errorMessage,
            requestId,
        });

        if (errorCode === 'INVALID_ZIP') {
            await deleteUserEntry(userId);
        }
    }
};
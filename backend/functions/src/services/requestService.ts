import * as admin from "firebase-admin";
import { IRequest } from "../types";

export const registerRequestProcessing = async (req: IRequest): Promise<void> => {
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
};

export const deleteUserEntry = async (userId: string): Promise<void> => {
    const db = admin.database();
    const userRef = db.ref(`/users/${userId}`);
    await userRef.remove();
};
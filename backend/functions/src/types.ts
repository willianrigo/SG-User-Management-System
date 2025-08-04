export interface IUser {
    userId: string,
    name: string,
    email: string,
    zip: string,
    lastUpdated: Date,
    lastRequestId: string,
    geoData?: IGeoData
}

export interface IGeoData {
    lat: number,
    lon: number,
    timezone: number,
    cityName: string
}

export interface IRequest {
    status: 'success' | 'error',
    errorCode?: 'INVALID_ZIP' | 'MISSING_REQ_ATTR' | 'INVALID_API_KEY' | 'GENERIC_ERROR',
    errorMessage?: string,
    requesterUserId: string,
    requestId: string
}
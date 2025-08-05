export interface IUser {
    id: string;
    name: string;
    email?: string;
    zip: string;
    lastRequestId: string;
    geoData?: {
      lat?: number;
      lon?: number;
      timezone?: number;
      cityName?: string;
    };
  }
  
  export interface IRequestStatus {
    status: "success" | "error" | string;
    errorCode?: string | null;
    errorMessage?: string | null;
    timestamp?: number;
    requesterUserId?: string;
  }
  
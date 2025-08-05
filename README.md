# User management system with geolocation data

## Overview

### Required Features
- Name and Zip Code being manually inputted for each user;
- ID will be randomly generated;
- Latitude, Longitude and Timezone are automatically fetched from the Zip Code;
- If the Zip Code changes, Latitude, Longitude and Timezone should be automatically updated;

### Extra Features
- Users entries with Invalid ZIP codes are automatically deleted after being created/updated;
- ACL with Auth System (connected to Firebase Auth);

## Implementation details and rationale

### Exploring Firebase Realtime Database Potential
Key value of Firebase RTDB:
- Live, real-time syncing across clients;
- A good fit to work with dynamic UIs;
- Works well with offline-online data syncing;

### Frontend Architecture
- The frontend is connected to the database directly since RTDB's SDK enables this type of connection. The ZIP code is processed with RTDB triggers after the user entry is created or updated. This creates a challenge of the frontend application not receiving a direct response if the ZIP code is invalid for instance. In order to fix that, we use another set of entries in the database called "Requests". The frontend keeps track of a unique request when it creates/updates an user entry by listening to the "Requests" node and it listens to the status change of that requests in that way. This way it can easily show to the admin user if the ZIP code processing went well or not.


#### DB Connection
- Connecting directly from a frontend application to a database is not usually a good practice. However, Firebase RTDB provides frontend SDKs that enable developers to make the most out of one of its main capabilities which is online-offline realtime syncing. Not all operations made in the database are done via this direct connection though. 

#### Stylization
- Used Tailwind.css for visual styles.

### Backend Architecture

#### Usage of Firebase Cloud Functions
- We're using Cloud Functions as a proxy to connect to the OpenWeather API, to avoid leaking API keys through the frontend;
- We make sure users are authenticated and have the correct role to read/write to the database;
- For automatically fetching lat/lon and timezone values, an `onCreate` Firebase RTDB trigger is set up to connect to the OpenWeather API and update these values automatically after the a new user entry is created or updated;

#### Data Validation with Firebase Rules

#### Error Handling
- In the case of the cloud function not being able to fetch the pair of lat/lon values, an error will stored in the `requests` object containing the `request_id` that was sent to by the frontend, in this way the frontend can know if any error happened durin the creation/update of a given user object.

# Setup

### Backend/Firebase
#### Running Locally
- Note: You will need a Firebase project with Blaze Plan in order to use the Firebase Secrets service.
- Make sure to have `Node v22.x.x` installed.
- Make sure you're using Firebase `v14.11.2` or higher.
- In order to deploy the configuration files inside of the `/backend` folder, make sure to assign a valid Firebase project name in the `.firebaserc` file, by replacing `project-name-here` by your project's name.
- Make sure you have `firebase-tools` installed and updated in your local environment or do it with the command `npm i -g firebase-tools`.
- Add the `OPENWEATHER_API_KEY` with the command `firebase functions:secrets:set OPENWEATHER_API_KEY`.
- Login with your firebase admin account with `firebase login` command.
- Initialize the Firebase emulators with the `firebase init emulators` command inside the `/backend` folder and after configuring it execute it with `firebase emulators:start`.

#### Deploying in a live Firebase project
- In order to enforce that only Users with admin privileges to manage users in the system, change the following section in `firebase.json` file

```
"database": {
  "rules": "database.rules.dev.json"
}
```

to

```
"database": {
    "rules": "database.rules.json"
}
```

### Frontend
- Navigate to the `/frontend` folder and run `npm i` to install the dependencies.

### Executing everything

#### Linux/macOS
- To start the entire backend + frontend stack make the `start-dev.sh` script executable with `chmod +x start-dev.sh` and then run `./start-dev.sh`

#### Windows
- Run the following commands in separate terminals:
  1. Navigate to `/backend` and run `firebase emulators:start`
  2. Navigate to `/frontend` and run `npm run dev`

#### Alternative (All platforms)
- Manually start each service:
  1. Backend: `cd backend && firebase emulators:start`
  2. Frontend: `cd frontend && npm run dev`

## Deployment Strategies
- The `/backend` project can be easily deployed to a Firebase project with a Blaze Plan (in order to use Authentication).
- The `/frontend` code can be easily deployed to a serverless service such as Vercel since we're using Next.js. 
# User management system with geolocation data

## Overview

### Required Features
- Name and Zip Code being manually inputted for each user;
- ID will be randomly generated;
- Latitude, Longitude and Timezone are automatically fetched from the Zip Code;
- If the Zip Code changes, Latitude, Longitude and Timezone should be automatically updated;

### Extra Features
- Interactive map with displaying of registered and unregistered users. It also visually displays the location change history for the user with vectors;
- Local connectivity indicator;
- ACL with Auth System (connected to Firebase Auth);
- Automated tests;
- Lighthouse audit;

## Implemetation details and rationale

### Exploring Firebase Realtime Database Potential
Key value of Firebase RTDB:
- Live, real-time syncing across clients;
- A good fit to work with dynamic UIs;
- Works well with offline-online data syncing;

### Frontend Architecture

#### DB Connection
- Connecting directly from a frontend application to a database is not usually a good practice. However, Firebase RTDB provides frontend SDKs that enable developers to make the most out of one of its main capabilities which is online-offline realtime syncing. Not all operations made in the database are done via this direct connection though. 

#### Folder Structure / Code Architecture

#### Data Fetching Strategy
- We're using a direct connection to Firebase RTDB through its SDK like it was mentioned before, 

#### Global State Management
- Using Redux and RTK: Although we could have used other simpler global state management  strategies for such a small application, I wanted to showcase how it would work by using Redux which could come handy if we wanted to expand the app features;

### Page Rendering Strategies (SSR, SSG, CSR)
Login Page: SSG
Users List: SSR
Interactive Map: CSR
User Details Page: SSR

#### Stylization

#### Automated Tests

#### Profiling


### Backend Architecture

#### Usage of Firebase Cloud Functions
- We're using Cloud Functions as a proxy to connect to the OpenWeather API, to avoid leaking API keys through the frontend;
- We make sure users are authenticated and have the correct role to read/write to the database;
- For automatically fetching lat/lon and timezone values, an `onCreate` Firebase RTDB trigger is set up to connect to the OpenWeather API and update these values automatically after the a new user entry is created or updated;

#### Automated Tests
- Using Jest + firebase-function-tests;

#### Connecting to CI/CD pipeline

#### Data Validation with Firebase Rules

#### Error Handling
- In the case of the cloud function not being able to fetch the pair of lat/lon values, an error will stored in the `requests` object containing the `request_id` that was sent to by the frontend, in this way the frontend can know if any error happened durin the creation/update of a given user object.

#### Deployment Strategies for the Backend with IaC



# Setup

### Backend/Firebase
- Make sure you're using Firebase `v14.11.2` or higher.
- In order to deploy the configuration files inside of the `/backend` folder, make sure to assign a valid Firebase project name in the `.firebaserc` file, by replacing `project-name-here` by your project's name.
- Make sure you have firebase-tools installed and updated in your local environment or do it with the command `npm i -g firebase-tools`.
- Login with your firebase admin account with `firebase login` command.
- Start the Firebase emulators with the `firebase init emulators` command.
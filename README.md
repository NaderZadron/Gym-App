## Server - All back-end functionality is contained here

#### Routes:

Consists of .js files that handle different request/response to a certain endpoint (mini-app). 

GET, POST, DELETE, and UPDATE (PUT) routes are defined in this directory for a specific endpoint and must be exported to index.js. See Express_auth slides, page 16 for more information.

- /routes/auth.js: Has all the user authentication routes (login, register, logout)
- /routes/class.js: Has all the routes for gathering, editing, adding, and deleting classes hosted by the gym 
- /routes/user.js: Has authenticated admin routes for getting the entire list of website users, and for deleting a specific user, along with general user routes for accessing/editing an individual profile

#### Middleware:

Consists of all the middleware functions to be used in the index.js file. This section includes two validators which, when called, check if a user is logged in, or if a user is defined as an admin. 

- The user is validated as logged in through the use of session cookies.
- The user is validated as an administrator through gathering the user's passport id for the session

#### Models:

Consists of all the mongoDB schemas that we will be using. Once a schema is designed, a new .js file will be made where the mongoDB schema is written in JS.

- /models/user: Has the user schema. User schema is based on the database design. User schema has a one-to-many relationship with the class collections.

- /models/class: Has the class schema. Design is based on figma. One-to-many relationship with the user schema.

#### seeds:

Consists of functions that can be easily ran using node in terminal that creates some type of seed data in local machine.

- /seeds/userSchemaSeed: Adds dummy data to the user collection in mongodb. To run, do node userSchemaSeed.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/22241646-c6ae8f9c-005f-4f22-9e56-00274f9995d4?action=collection%2Ffork&collection-url=entityId%3D22241646-c6ae8f9c-005f-4f22-9e56-00274f9995d4%26entityType%3Dcollection%26workspaceId%3D345d5336-45b0-4725-8e70-42642449c842)

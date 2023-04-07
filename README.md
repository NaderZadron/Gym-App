## Server: Has everything related to the server inside it.

#### Routes:

Consists of .js files that handle different request/response to a certain endpoint (mini-app). Define get, post, delete, update routes for a specific endpoint in this directory and export it to index.js. See Express_auth slides, page 16 for more information.

- /routes/auth.js: Has all of the user authentication routes (login, register, logout)

#### Middleware:

Consists of all the middleware functions to be used in the index.js file.

#### Models:

Consists of all of the mongoDB schemas that we will be using. Once a schema is designed, a new .js file will be made where the mongoDB schema is written in JS.

- /models/user: Has the user schema. User schema is based on the database design. User schema has a one to many relationship with the class collections.

- /models/class: Has the class schema. Design is based on figma. One to many relationship with the user schema.

#### seeds:

Consists of functions that can be easily ran using node in terminal that creates some type of seed data in local machine.

- /seeds/userSchemaSeed: Adds dummy data to the user collection in mongodb. To run, do node userSchemaSeed.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/22241646-c6ae8f9c-005f-4f22-9e56-00274f9995d4?action=collection%2Ffork&collection-url=entityId%3D22241646-c6ae8f9c-005f-4f22-9e56-00274f9995d4%26entityType%3Dcollection%26workspaceId%3D345d5336-45b0-4725-8e70-42642449c842)

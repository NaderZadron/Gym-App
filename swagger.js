const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gym App API",
      version: "1.0.0",
      description:
        "API for my gym app that interacts with mongoDB and renders using react",
    },
    servers: [
      {
        url: "https://limitless-ce6c.onrender.com",
        description: "Production server",
      },
      {
        url: "http://localhost:6001",
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js"], // Specify the path to your API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs;

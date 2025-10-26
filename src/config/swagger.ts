import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MDS API",
      version: "1.0.0",
      description: "API documentation for the MDS project",
    },
    servers: [
      {
        url: "https://api.jaedp.org/api/v1", // ✅ Always include full production base URL
      },
      {
        url: "http://localhost:5000/api/v1", // For local testing
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/docs/*.ts", "./src/routers/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);

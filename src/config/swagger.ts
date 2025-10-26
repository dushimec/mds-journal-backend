
import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MDS API',
      version: '1.0.0',
      description: 'API documentation for the MDS project',
    },
    servers: [
      {
        url: process.env.API_URL || '/api',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/docs/*.ts', './src/routers/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);

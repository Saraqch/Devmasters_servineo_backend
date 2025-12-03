import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Servineo API - Fixer Profile',
      version: '1.0.0',
      description: 'Documentación de la API para el perfil de Fixers en Servineo.',
    },
    servers: [
      {
        url: 'http://localhost:8000/api',
        description: 'Servidor de Desarrollo',
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
  },
  apis: [
    './src/routes/job_offer.routes.ts',
    './src/routes/experience.routes.ts',
    './src/routes/certification.routes.ts',
    './src/routes/portfolio.routes.ts',
    './src/routes/user_upgrade.routes.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);

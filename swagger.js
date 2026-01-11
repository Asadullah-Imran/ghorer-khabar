const swaggerDefinition = {
  api: {
    openapi: '3.0.0',
    info: {
      title: 'Ghorer Khabar API',
      version: '1.0.0',
      description: 'API documentation for the Ghorer Khabar application.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/app/api/**/*.ts'], // Path to the API routes
};

module.exports = swaggerDefinition;

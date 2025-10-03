const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require("swagger-jsdoc");
const fs = require('fs').promises;
const path = require('path');

async function setupSwagger(app) {
  try {
    const data = await fs.readFile(path.join(__dirname, 'swagger.json'), 'utf8');
    const swaggerDocument = JSON.parse(data);
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        swaggerOptions: { docExpansion: 'none', tryItOutEnabled: true },
        customCss: '.swagger-ui .topbar { background-color: #2c3e50; }',
        customSiteTitle: 'Grace Pharmacy Users API Documentation',
      })
    );
  } catch (err) {
    console.error('Error loading Swagger document:', err.message);
    app.use('/api-docs', (req, res) =>
      res.status(500).json({ error: 'Failed to load API documentation' })
    );
  }
}



module.exports = setupSwagger;

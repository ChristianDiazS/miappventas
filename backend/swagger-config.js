import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MiAppVentas API',
      version: '1.0.0',
      description: 'API completa para plataforma de e-commerce de joyería y decoración',
      contact: {
        name: 'Equipo de Desarrollo',
        email: 'dev@miappventas.com'
      },
      license: {
        name: 'MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Desarrollo',
        variables: {
          port: {
            default: '5000'
          }
        }
      },
      {
        url: 'https://api.miappventas.com',
        description: 'Producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticación'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'ID único del usuario' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { 
              type: 'string', 
              enum: ['USER', 'ADMIN', 'SUPERADMIN'],
              description: 'Rol del usuario'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', format: 'decimal' },
            category: { type: 'string' },
            image: { type: 'string', format: 'uri' },
            stock: { type: 'integer' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            status: { 
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
            },
            total: { type: 'number', format: 'decimal' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            code: { type: 'string' },
            details: { type: 'object' }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: 'Token inválido o expirado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        Forbidden: {
          description: 'Acceso denegado - permisos insuficientes',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        BadRequest: {
          description: 'Solicitud inválida',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Endpoints de estado del servidor'
      },
      {
        name: 'Autenticación',
        description: 'Endpoints de login y registro'
      },
      {
        name: 'Productos',
        description: 'Gestión de productos'
      },
      {
        name: 'Carrito',
        description: 'Gestión del carrito de compras'
      },
      {
        name: 'Órdenes',
        description: 'Gestión de órdenes y compras'
      },
      {
        name: 'Perfil',
        description: 'Gestión de perfil de usuario'
      },
      {
        name: 'SUPERADMIN',
        description: 'Panel administrativo - Solo para SUPERADMIN'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/routes/superadmin/*.js'
  ]
};

export const specs = swaggerJsdoc(options);

import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  APP_PORT: Joi.number().default(3000),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173,http://localhost:4321'),

  // PostgreSQL (Write)
  DB_WRITE_HOST: Joi.string().required(),
  DB_WRITE_PORT: Joi.number().default(5433),
  DB_WRITE_USER: Joi.string().required(),
  DB_WRITE_PASSWORD: Joi.string().required(),
  DB_WRITE_NAME: Joi.string().required(),

  // MongoDB (Read)
  DB_READ_HOST: Joi.string().required(),
  DB_READ_PORT: Joi.number().default(27017),
  DB_READ_USER: Joi.string().required(),
  DB_READ_PASSWORD: Joi.string().required(),
  DB_READ_NAME: Joi.string().required(),

  // Zusammengesetzte URLs
  DATABASE_URL: Joi.string().required(),
  MONGO_URL: Joi.string().required(),

  // Redis Cache
  REDIS_HOST: Joi.string().required(), 
  REDIS_PORT: Joi.number().default(6379),
  REDIS_TTL: Joi.number().default(3600),

  // JWT
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),

  // Mailpit
  SMTP_HOST: Joi.string().required(), 
  SMTP_PORT: Joi.number().default(1025), 
  MAIL_FROM: Joi.string().required()
});

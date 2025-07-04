export interface EnvironmentConfig {
  port: number;
  pythonAiUrl: string;
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

export const config: EnvironmentConfig = {
  port: parseInt(process.env.PORT || '3000'),
  pythonAiUrl: process.env.PYTHON_AI_URL || 'http://localhost:8000',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mellow_db',
    user: process.env.DB_USER || 'mellow_user',
    password: process.env.DB_PASSWORD || 'mellow_password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
}; 
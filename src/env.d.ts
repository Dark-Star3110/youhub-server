declare namespace NodeJS {
  export interface ProcessEnv {
    MSSQL_SERVERNAME: string;
    MSSQL_USERNAME: string;
    MSSQL_PASSWORD: string;
    MSSQL_DBNAME: string;
    AZURE_SERVER_NAME: string;
    AZURE_UID: string;
    AZURE_PASSWORD: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    REDIRECT_URI: string;
    REFRESH_TOKEN: string;
    REFRESH_TOKEN_MAIL: string;
    PORT: string;
    CLIENT_DOMAINS: string;
    MONGO_PROP_URL: string;
    MONGO_DEV_URL: string;
    JWT_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    SESSION_EXPIRY: string;
    REFRESH_TOKEN_EXPIRY: string;
    COOKIE_SECRET: string;
    REDIS_SERVER_NAME: string;
    REDIS_PASSWORD: string;
  }
}

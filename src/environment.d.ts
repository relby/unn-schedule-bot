declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            REDIS_HOST: string;
            REDIS_PORT: number;
        }
    }
}

export {}

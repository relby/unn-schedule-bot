declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            REDIS_URL: string;
        }
    }
}

export {}

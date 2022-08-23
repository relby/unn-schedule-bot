import { Bot, session } from 'grammy';
import { BotCommand } from 'typegram';
import { conversations } from '@grammyjs/conversations'
import glob from 'glob';
import { promisify } from 'util';
import path from 'path';
import { Command } from './Command';
import { MyContext, SessionData } from '../typings/bot'
import Redis from 'ioredis';
import assert from 'assert';
import { RedisAdapter } from '@grammyjs/storage-redis';
import cron from 'node-cron';
import { dateToTimeString, lessonsByDate, lessonsReplyByDate } from '../helpers';

const globPromise = promisify(glob)

export class ExtendedBot extends Bot<MyContext> {
    public db!: Redis;

    constructor() {
        const { BOT_TOKEN } = process.env;
        if (!BOT_TOKEN) {
            console.error('Provide BOT_TOKEN to env variables')
            process.exit(1)
        }
        super(process.env.BOT_TOKEN!)

        // Initialize database
        const { REDIS_URL } = process.env;
        assert(REDIS_URL, 'MISSING `REDIS_URL` ENV VARIABLE')
        const db = new Redis(REDIS_URL);
        const storage = new RedisAdapter({ instance: db, ttl: 0 });

        this.use(session({
            initial: (): SessionData => ({
                group: null,
                notifications: []
            }),
            storage
        }));

        this.db = db;
    }

    async importFile (filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands() {
        const commandsToRegister: BotCommand[] = [];
        const commandFiles = await globPromise(`${__dirname}/../commands/*{.ts,.js}`.replace(/\\/g, '/'));
        console.log('Commands:');
        for (const filePath of commandFiles) {
            console.log(`  /${path.parse(filePath).name}`);
            const command: Command = await this.importFile(filePath);
            this.command(command.name, ...command.middlewares);
            commandsToRegister.push({ command: command.name, description: command.description });
        }
        await this.api.setMyCommands(commandsToRegister);

    }

    cronJobs() {
        cron.schedule('* * * * *', async now => {
            const keys = await this.db.keys('*');
            keys.forEach(async key => {
                const userString = await this.db.get(key);
                if (!userString) return;
                const user: SessionData = JSON.parse(userString);
                if (!user.group) return;
                for (const notification of user.notifications) {
                    if (notification.time === dateToTimeString(now)) {
                        let reply: string;
                        switch (notification.day) {
                            case 'today':
                                reply = await lessonsReplyByDate(user.group.id, now);
                                break;
                            case 'tomorrow':
                                const tomorrow = new Date(now.getTime())
                                tomorrow.setDate(tomorrow.getDate() + 1)
                                reply = await lessonsReplyByDate(user.group.id, tomorrow);
                                break;
                        }
                        await this.api.sendMessage(key, reply)
                    }
                }
            })
        });
    }

    async start() {
        this.use(conversations());
        this.registerCommands();
        this.cronJobs();
        this.catch(console.error);
        super.start();
    }
}

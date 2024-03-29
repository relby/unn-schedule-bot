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
import { lessonsReplyByDate } from '../helpers';
import { DateTime, Duration, FixedOffsetZone } from 'luxon';

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
        const { REDIS_PORT, REDIS_HOST } = process.env;
        assert(REDIS_PORT && REDIS_HOST, `MISSING 'REDIS_HOST' or 'REDIS_PORT' ENV VARIABLE`)
        const db = new Redis(REDIS_PORT, REDIS_HOST);
        const storage = new RedisAdapter<SessionData>({ instance: db, ttl: 0 });

        this.use(session<SessionData, MyContext>({
            initial: () => ({
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
        cron.schedule('* * * * *', async _ => {
            const keys = await this.db.keys('*');
            keys.forEach(async key => {
                const userString = await this.db.get(key);
                if (!userString) return;
                const user: SessionData = JSON.parse(userString);
                if (!user.group) return;
                for (const { time, day } of user.notifications) {
                    const dt = DateTime.fromISO(time);
                    const utc = DateTime
                        .utc()
                        .setZone(FixedOffsetZone.instance(dt.offset))
                        .set({second: 0, millisecond: 0});
                    const diff = dt.diff(utc, ['hours', 'minutes'])
                    if (diff.equals(Duration.fromObject({ seconds: 0 }))) {
                        let reply: string;
                        switch (day) {
                            case 'today':
                                reply = await lessonsReplyByDate(user.group.id, DateTime.now());
                                break;
                            case 'tomorrow':
                                reply = await lessonsReplyByDate(user.group.id, DateTime.now().plus({ days: 1 }));
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

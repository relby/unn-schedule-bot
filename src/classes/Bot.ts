import { Bot, session } from 'grammy';
import { BotCommand } from 'typegram';
import { freeStorage } from '@grammyjs/storage-free'
import { conversations } from '@grammyjs/conversations'
import glob from 'glob';
import { promisify } from 'util';
import path from 'path';
import { Command } from './Command';
import { MyContext, SessionData } from '../typings/bot'

const globPromise = promisify(glob)

export class ExtendedBot extends Bot<MyContext> {

    constructor() {
        const { BOT_TOKEN } = process.env;
        if (!BOT_TOKEN) {
            console.error('Provide BOT_TOKEN to env variables')
            process.exit(1)
        }
        super(process.env.BOT_TOKEN!)
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

    async start() {
        this.use(session({
            initial: () => ({ group: null }),
            storage: freeStorage<SessionData>(this.token)
        }));

        this.use(conversations());

        this.registerCommands();

        this.catch(console.error);
        super.start();
    }
}

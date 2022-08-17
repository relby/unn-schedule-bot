import dotenv from 'dotenv';
dotenv.config()
import { Bot, Context, session, SessionFlavor } from 'grammy';
import { BotCommand } from 'typegram';
import { freeStorage } from '@grammyjs/storage-free'
import { type Conversation, type ConversationFlavor, conversations } from '@grammyjs/conversations'
import glob from 'glob';
import { promisify } from 'util';
import path from 'path';
import { Command } from './classes/Command';

const { BOT_TOKEN } = process.env;

if (!BOT_TOKEN) {
    console.error('Provide BOT_TOKEN to env variables')
    process.exit(1)
}

interface SessionData {
    group: {
        name: string;
        id: string;
    } | null;
}

export type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
export type MyConversation = Conversation<MyContext>;

export const bot = new Bot<MyContext>(BOT_TOKEN);

bot.use(session({
    initial: () => ({ group: null }),
    storage: freeStorage<SessionData>(bot.token)
}))

bot.use(conversations())

const globPromise = promisify(glob)

const importFile = async (filePath: string) => {
    return (await import(filePath))?.default;
}

const registerCommands = async () => {
    // TODO: Implement bot.api.setMyCommands
    const commandsToRegister: BotCommand[] = [];
    const commandFiles = await globPromise(`${__dirname}/commands/*{.ts,.js}`.replace(/\\/g, '/'));
    console.log('Commands:');
    for (const filePath of commandFiles) {
        console.log(`  /${path.parse(filePath).name}`);
        const command: Command = await importFile(filePath);
        bot.command(command.name, ...command.middlewares);
        commandsToRegister.push({ command: command.name, description: command.description });
    }
    await bot.api.setMyCommands(commandsToRegister);
}

registerCommands();

bot.catch(console.error);

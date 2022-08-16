import dotenv from 'dotenv';
dotenv.config()
import { Bot, Context, session, SessionFlavor } from 'grammy';
import { freeStorage } from '@grammyjs/storage-free'
import { type Conversation, type ConversationFlavor, conversations } from '@grammyjs/conversations'
import glob from 'glob';
import { promisify } from 'util';
import path from 'path';

const { BOT_TOKEN } = process.env;

if (!BOT_TOKEN) {
    console.error('Provide BOT_TOKEN to env variables')
    process.exit(1)
}

interface SessionData {
    groupName: string | null;
    groupId: string | null;
}

export type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
export type MyConversation = Conversation<MyContext>;

export const bot = new Bot<MyContext>(BOT_TOKEN);

bot.use(session({
    initial: () => ({ groupName: null, groupId: null }),
    storage: freeStorage<SessionData>(bot.token)
}))

bot.use(conversations())

const globPromise = promisify(glob)
const registerCommands = async () => {
    // TODO: Implement bot.api.setMyCommands
    const commandsToRegister: string[] = [];
    const commandFiles = await globPromise(`${__dirname}/commands/*{.ts,.js}`.replace(/\\/g, '/'));
    console.log('Commands:');
    commandFiles.forEach(async filePath => { 
        console.log(`  /${path.parse(filePath).name}`);
        commandsToRegister.push(filePath)
        await import(filePath);
    });
}

registerCommands();

bot.api.setMyCommands([
    { command: 'setgroup',    description: 'TODO' },
    { command: 'mygroup',     description: 'TODO' },
    { command: 'today',       description: 'TODO' },
    { command: 'tomorrow',    description: 'TODO' },
    { command: 'deletegroup', description: 'TODO' },
])

bot.catch(console.error);
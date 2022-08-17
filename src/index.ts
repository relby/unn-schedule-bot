
import dotenv from 'dotenv';
dotenv.config()
import { ExtendedBot } from './classes/Bot';

export const bot = new ExtendedBot();

bot.start();

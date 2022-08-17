import { CommandMiddleware } from 'grammy'
import { MyContext } from './bot'

export interface CommandType {
    name: string;
    description: string;
    middlewares: CommandMiddleware<MyContext>[];
}

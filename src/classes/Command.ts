import { CommandMiddleware } from "grammy";
import { MyContext } from "../bot";
import { CommandType } from "../typings/command";

export class Command implements CommandType {
    name!: string;
    description!: string;
    middlewares!: CommandMiddleware<MyContext>[];

    constructor(commandOptions: CommandType) {
        Object.assign(this, commandOptions);
    }
}

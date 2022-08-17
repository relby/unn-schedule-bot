import { bot } from "..";
import { Command } from "../classes/Command";

export default new Command({
    name: 'test',
    description: 'test',
    middlewares: [
        async ctx => {
            await bot.api.sendMessage(ctx.chat.id, 'test')
            await ctx.reply((await bot.db.keys("*")).join(', '))
        }
    ]
})

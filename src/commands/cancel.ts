import { bot } from '../bot';

bot.command('cancel', async ctx => {
    await ctx.conversation.exit();
})

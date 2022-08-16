import { bot } from '../bot'

bot.command('deletegroup', async ctx => {
    ctx.session.group = null;
    ctx.reply('Your group have been deleted');
})

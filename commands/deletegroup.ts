import { bot } from '../bot'

bot.command('deletegroup', async ctx => {
    ctx.session.groupName = null;
    ctx.session.groupId = null;
    ctx.reply('Your group have been deleted')
})

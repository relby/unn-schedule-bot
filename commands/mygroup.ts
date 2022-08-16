import { NO_GROUP_MESSAGE } from '../helpers';
import { bot } from '../bot';

bot.command('mygroup', async ctx => {
    const { groupName, groupId } = ctx.session;
    if (!groupName || !groupId) {
        return await ctx.reply(NO_GROUP_MESSAGE);
    }
    return await ctx.reply(`Your group is \`${groupName}\`\\. You can change it with /setgroup command`, { parse_mode: "MarkdownV2" });
})

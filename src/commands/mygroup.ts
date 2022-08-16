import { NO_GROUP_MESSAGE } from '../helpers';
import { bot } from '../bot';

bot.command('mygroup', async ctx => {
    const { group } = ctx.session;
    if (!group) {
        return await ctx.reply(NO_GROUP_MESSAGE);
    }
    return await ctx.reply(`Your group is \`${group.name}\`\\. You can change it with /setgroup command`, { parse_mode: "MarkdownV2" });
})

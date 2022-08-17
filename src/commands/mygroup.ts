import { bot } from '../bot';
import { checkGroup } from '../middlewares';
import assert from 'assert';

bot.command('mygroup', checkGroup, async ctx => {
    assert(ctx.session.group);
    const { group } = ctx.session;
    return await ctx.reply(`Your group is \`${group.name}\`\\. You can change it with /setgroup command`, { parse_mode: "MarkdownV2" });
})

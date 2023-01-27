import { checkGroup } from '../middlewares';
import assert from 'assert';
import { Command } from '../classes/Command';

export default new Command({
    name: 'mygroup',
    description: 'Get the info of your group',
    middlewares: [
        checkGroup,
        async ctx => {
            assert(ctx.session.group);
            const { group } = ctx.session;
            return await ctx.reply(`Your group is \`${group.name}\`\\. You can change it with /setgroup command`, { parse_mode: "MarkdownV2" });
        }
    ]
})

import { lessonsByDate, lessonsReplyByDate } from '../helpers';
import { checkGroup } from '../middlewares';
import assert from 'assert';
import { Command } from '../classes/Command';

export default new Command({
    name: 'today',
    description: 'TODO',
    middlewares: [
        checkGroup,
        async ctx => {
            assert(ctx.session.group);
            const { group } = ctx.session;
            const today = new Date();
            const reply = await lessonsReplyByDate(group.id, today)
            return await ctx.reply(reply);
        }
    ]
})

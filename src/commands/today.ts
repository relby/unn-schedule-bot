import { lessonsByDate, lessonsReplyByDate } from '../helpers';
import { checkGroup } from '../middlewares';
import assert from 'assert';
import { Command } from '../classes/Command';
import { DateTime } from 'luxon';

export default new Command({
    name: 'today',
    description: `Get tomorrow's lessons`,
    middlewares: [
        checkGroup,
        async ctx => {
            assert(ctx.session.group);
            const { group } = ctx.session;
            const reply = await lessonsReplyByDate(group.id, DateTime.now())
            return await ctx.reply(reply);
        }
    ]
})

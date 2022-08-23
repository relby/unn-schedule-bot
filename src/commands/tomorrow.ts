import { lessonsByDate, lessonsReplyByDate } from '../helpers';
import { checkGroup } from '../middlewares';
import assert from 'assert';
import { Command } from '../classes/Command';

export default new Command({
    name: 'tomorrow',
    description: 'TODO',
    middlewares: [
        checkGroup,
        async ctx => {
            assert(ctx.session.group);
            const { group } = ctx.session;
            const tomorrow = new Date();
            tomorrow.setDate(new Date().getDate() + 1);
            const reply = await lessonsReplyByDate(group.id, tomorrow);
            return await ctx.reply(reply)
        }
    ]
})

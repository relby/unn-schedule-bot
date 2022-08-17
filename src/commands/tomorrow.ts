import { lessonsByDate } from '../helpers';
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
            const lessons = await lessonsByDate(group.id, tomorrow);
            if (lessons.length === 0) {
                return await ctx.reply(`There is no lessons tomorrow`)
            }
            const reply = lessons
                .map((lesson, i) => `${i+1}) ${lesson.beginLesson}-${lesson.endLesson} ${lesson.discipline} ${lesson.kindOfWork}`)
                .join('\n')
            return await ctx.reply(reply)
        }
    ]
})

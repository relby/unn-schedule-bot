import { lessonsByDate } from '../helpers';
import { checkGroup } from '../middlewares';
import { bot } from '../bot';
import assert from 'assert';

bot.command('today', checkGroup, async ctx => {
    assert(ctx.session.group);
    const { group } = ctx.session;
    const today = new Date();
    const lessons = await lessonsByDate(group.id, today);
    if (lessons.length === 0) {
        return await ctx.reply(`There is no lessons today`);
    }
    const reply = lessons
        .map((lesson, i) => `${i+1}) ${lesson.beginLesson}-${lesson.endLesson} ${lesson.discipline} ${lesson.kindOfWork}`)
        .join('\n');
    return await ctx.reply(reply);
});

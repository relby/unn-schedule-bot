import { lessonsByDate, NO_GROUP_MESSAGE } from '../helpers';
import { bot } from '../bot';

bot.command('today', async ctx => {
    const { group } = ctx.session;
    if (!group) {
        return await ctx.reply(NO_GROUP_MESSAGE);
    }
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
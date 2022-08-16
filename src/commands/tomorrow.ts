import { NO_GROUP_MESSAGE, lessonsByDate } from '../helpers';
import { bot } from '../bot';

bot.command('tomorrow', async ctx => {
    const { group } = ctx.session;
    if (!group) {
        return await ctx.reply(NO_GROUP_MESSAGE);
    }
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
})
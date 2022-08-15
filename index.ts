import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config()
import { Bot, Context, InlineKeyboard, lazySession, LazySessionFlavor } from 'grammy';
import { freeStorage } from '@grammyjs/storage-free'
import { Lesson, SearchGroup } from './types'

interface SessionData {
    group: {
        name: string
        id: string
    } | null
}

type MyContext = Context & LazySessionFlavor<SessionData>;

const { BOT_TOKEN } = process.env;

if (!BOT_TOKEN) {
    console.error("Provide BOT_TOKEN to env variables")
    process.exit(1)
}

const bot = new Bot<MyContext>(BOT_TOKEN);

bot.use(lazySession({
    initial: () => ({group: null}),
    storage: freeStorage<SessionData>(bot.token)
}))

const API_SCHEDULE_URL = "https://portal.unn.ru/ruzapi/schedule/group/";
const API_SEARCH_URL = "https://portal.unn.ru/ruzapi/search";
const NO_GROUP_MESSAGE = `You don't have your group configured. Use /addgroup command to add the group to your account`;


// TODO: Rewrite start message
const dateToParamsString = (date: Date): string => `${date.getFullYear()}.${(date.getMonth()).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`

bot.command('addgroup', async ctx => {
    const args = ctx.message!.text.split(' ').slice(1);
    if (args.length === 0) {
        return await ctx.reply('You have to provide group name');
    }
    const [groupName] = args;

    const groups = (await axios.get(API_SEARCH_URL, {
        params: {
            term: groupName,
            type: 'group'
        }
    })).data as SearchGroup[];

    if (groups.length === 0) {
        return await ctx.reply(`Group \`${groupName}\` haven't been found`);
    }
   
    if (groups[0].label.toLowerCase() === groupName.toLowerCase()) {
        (await ctx.session).group = {
            name: groups[0].label,
            id: groups[0].id
        }
        return await ctx.reply(`Group \`${groupName}\` have been added to your account`);
    }
    // TODO: Make it with Menu plugin
    const inlineKeyboard = new InlineKeyboard()
        .text(groups[0].label, `addgroup-${groups[0].label}-${groups[0].id}`)
        .text(groups[1].label, `addgroup-${groups[1].label}-${groups[1].id}`)
        .text(groups[2].label, `addgroup-${groups[2].label}-${groups[2].id}`)
    return await ctx.reply(`${groupName} haven't been found. Maybe you meant this?`, { reply_markup: inlineKeyboard })
})

bot.callbackQuery(/^addgroup-(.+)$/, async (ctx) => {
    const [name, id] = ctx.callbackQuery.data.split('-').slice(1);
    (await ctx.session).group = { name, id };
    const text = `Group \`${name}\` have been added to your account`;
    await ctx.answerCallbackQuery({ text });
    await ctx.editMessageText(text);
})

bot.command('mygroup', async ctx => {
    const myGroup = (await ctx.session).group;
    if (!myGroup) {
        return await ctx.reply(NO_GROUP_MESSAGE);
    }
    return await ctx.reply(`Your group is \`${myGroup.name}\`. You can change it with /addgroup command`);
})

bot.command('today', async ctx => {
    const myGroup = (await ctx.session).group;
    // TODO: Move to function
    if (!myGroup) {
        return await ctx.reply(NO_GROUP_MESSAGE);
    }
    const today = new Date(2022, 2, 1);
    const start = dateToParamsString(today);
    const lessons = (await axios.get(`${API_SCHEDULE_URL}/${myGroup.id}`, {
        params: {
            start,
            finish: start
        }
    })).data as Lesson[];
    if (lessons.length === 0) {
        return await ctx.reply(`There is no lessons today`)
    }
    const reply = lessons
        .map((lesson, i) => `${i+1}) ${lesson.beginLesson}-${lesson.endLesson} ${lesson.discipline} ${lesson.kindOfWork}`)
        .join('\n')
    return await ctx.reply(reply)
});

bot.api.setMyCommands([
    { command: 'addgroup', description: 'TODO' },
    { command: 'mygroup', description: 'TODO' },
    { command: 'today', description: 'TODO' }
])

bot.catch(console.error)
bot.start()
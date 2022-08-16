import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config()
import { Bot, Context, InlineKeyboard, lazySession, LazySessionFlavor, session, SessionFlavor } from 'grammy';
import { freeStorage } from '@grammyjs/storage-free'
import { type Conversation, type ConversationFlavor, conversations, createConversation } from '@grammyjs/conversations'
import { Lesson, SearchGroup } from './types'

interface SessionData {
    groupName: string | null;
    groupId: string | null;
}

type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

const { BOT_TOKEN } = process.env;

if (!BOT_TOKEN) {
    console.error('Provide BOT_TOKEN to env variables')
    process.exit(1)
}

const bot = new Bot<MyContext>(BOT_TOKEN);

bot.use(session({
    initial: () => ({ groupName: null, groupId: null }),
    storage: freeStorage<SessionData>(bot.token)
}))

bot.use(conversations())

const setgroup = async (conversation: MyConversation, ctx: MyContext) => {
    await ctx.reply("Enter your group name");
    const { message } = await conversation.wait();
    if (!message || !message.text) return await ctx.reply(`You didn't provide the group name`);

    const groupName = message.text;

    const groups = (await conversation.external(() => axios.get(API_SEARCH_URL, {
        params: {
            term: groupName,
            type: 'group'
        }
    }))).data as SearchGroup[];
    if (groups.length === 0) {
        return await ctx.reply(`Group \`${groupName}\` haven't been found`, { parse_mode: "MarkdownV2" });
    }
   
    if (groups[0].label.toLowerCase() === groupName.toLowerCase()) {
        return await ctx.reply(`Group \`${groupName}\` have been added to your account`, { parse_mode: "MarkdownV2" });
    }
    let inlineKeyboard = new InlineKeyboard()
    for (let i = 0; i < Math.min(groups.length, 3); i++) {
        inlineKeyboard = inlineKeyboard.text(groups[i].label, `setgroup-${groups[i].label}-${groups[i].id}`);
    }
    return await ctx.reply(`\`${groupName}\` haven't been found\\. Did you mean this?`, { reply_markup: inlineKeyboard, parse_mode: "MarkdownV2" })
}

bot.use(createConversation(setgroup))

const API_SCHEDULE_URL = "https://portal.unn.ru/ruzapi/schedule/group/";
const API_SEARCH_URL = "https://portal.unn.ru/ruzapi/search";
const NO_GROUP_MESSAGE = `You don't have your group configured. Use /setgroup command to add the group to your account`;

const dateToParamsString = (date: Date): string => `${date.getFullYear()}.${(date.getMonth()).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`

bot.command('setgroup', async ctx => {
    await ctx.conversation.enter('setgroup');
})

bot.callbackQuery(/^setgroup-(.+)$/, async (ctx) => {
    const [name, id] = ctx.callbackQuery.data.split('-').slice(1);
    ctx.session.groupName = name;
    ctx.session.groupId = id;
    const text = `Group \`${name}\` have been added to your account`;
    await ctx.answerCallbackQuery({ text });
    await ctx.editMessageText(text, { parse_mode: "MarkdownV2" });
})

bot.command('mygroup', async ctx => {
    const { groupName, groupId } = ctx.session;
    if (!groupName || !groupId) {
        return await ctx.reply(NO_GROUP_MESSAGE);
    }
    return await ctx.reply(`Your group is \`${groupName}\`\\. You can change it with /setgroup command`, { parse_mode: "MarkdownV2" });
})

const lessonsByDate = async (groupId: string, date: Date): Promise<Lesson[]> => {
    const start = dateToParamsString(date);
    const lessons = (await axios.get(`${API_SCHEDULE_URL}/${groupId}`, {
        params: {
            start,
            finish: start
        }
    })).data as Lesson[];
    return lessons;
}

bot.command('today', async ctx => {
    const { groupName, groupId } = ctx.session;
    if (!groupName || !groupId) {
        return await ctx.reply(NO_GROUP_MESSAGE);
    }
    const today = new Date();
    const lessons = await lessonsByDate(groupId, today);
    if (lessons.length === 0) {
        return await ctx.reply(`There is no lessons today`)
    }
    const reply = lessons
        .map((lesson, i) => `${i+1}) ${lesson.beginLesson}-${lesson.endLesson} ${lesson.discipline} ${lesson.kindOfWork}`)
        .join('\n')
    return await ctx.reply(reply)
});

bot.command('tomorrow', async ctx => {
    const { groupName, groupId } = ctx.session;
    if (!groupName || !groupId) {
        return await ctx.reply(NO_GROUP_MESSAGE);
    }
    const tomorrow = new Date();
    tomorrow.setDate(new Date().getDate() + 1);
    const lessons = await lessonsByDate(groupId, tomorrow);
    if (lessons.length === 0) {
        return await ctx.reply(`There is no lessons tomorrow`)
    }
    const reply = lessons
        .map((lesson, i) => `${i+1}) ${lesson.beginLesson}-${lesson.endLesson} ${lesson.discipline} ${lesson.kindOfWork}`)
        .join('\n')
    return await ctx.reply(reply)
})

bot.command('deletegroup', async ctx => {
    ctx.session.groupName = null;
    ctx.session.groupId = null;
    ctx.reply('Your group have been deleted')
})

bot.api.setMyCommands([
    { command: 'setgroup',    description: 'TODO' },
    { command: 'mygroup',     description: 'TODO' },
    { command: 'today',       description: 'TODO' },
    { command: 'tomorrow',       description: 'TODO' },
    { command: 'deletegroup', description: 'TODO' },
])

bot.catch(console.error)
bot.start()
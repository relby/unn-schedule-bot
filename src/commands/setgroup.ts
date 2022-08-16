import axios from 'axios'
import { SearchGroup } from '../types';
import { InlineKeyboard } from 'grammy';
import { MyConversation, MyContext, bot } from '../bot'
import { createConversation } from '@grammyjs/conversations'

const { API_URL } = process.env;

// Create setgroup command conversation
const setgroup = async (conversation: MyConversation, ctx: MyContext) => {
    await ctx.reply("Enter your group name");
    ctx = await conversation.wait();
    const { message } = ctx;

    if (!message || !message.text) return await ctx.reply(`You didn't provide the group name`);

    const groupName = message.text;

    const groups = (await conversation.external(() => axios.get(`${API_URL}/search`, {
        params: {
            term: groupName,
            type: 'group'
        }
    }))).data as SearchGroup[];
    if (groups.length === 0) {
        return await ctx.reply(`Group \`${groupName}\` haven't been found`, { parse_mode: "MarkdownV2" });
    }
   
    if (groups[0].label.toLowerCase() === groupName.toLowerCase()) {
        ctx.session.group = {
            name: groups[0].label,
            id:   groups[0].id
        }
        return await ctx.reply(`Group \`${groups[0].label}\` have been added to your account`, { parse_mode: "MarkdownV2" });
    }
    let inlineKeyboard = new InlineKeyboard()
    for (let i = 0; i < Math.min(groups.length, 3); i++) {
        inlineKeyboard = inlineKeyboard.text(groups[i].label, `setgroup-${groups[i].label}-${groups[i].id}`);
    }
    return await ctx.reply(`\`${groupName}\` haven't been found\\. Did you mean this?`, { reply_markup: inlineKeyboard, parse_mode: "MarkdownV2" })
}

// Use setgroup conversation
bot.use(createConversation(setgroup))

// Handle button interaction
bot.callbackQuery(/^setgroup-(.+)$/, async (ctx) => {
    const [name, id] = ctx.callbackQuery.data.split('-').slice(1);
    ctx.session.group = {name, id}
    const text = `Group \`${name}\` have been added to your account`;
    await ctx.answerCallbackQuery({ text });
    await ctx.editMessageText(text, { parse_mode: "MarkdownV2" });
})

// Register setgroup command
bot.command('setgroup', async ctx => {
    await ctx.conversation.enter('setgroup');
})
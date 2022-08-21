import axios from 'axios'
import { SearchGroup } from '../typings/api';
import { InlineKeyboard } from 'grammy';
import { MyConversation, MyContext } from '../typings/bot'
import { bot } from '../index';
import { createConversation } from '@grammyjs/conversations'
import { Command } from '../classes/Command';

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
        return await ctx.reply(`Group \`${groupName}\` hasn't been found`, { parse_mode: "MarkdownV2" });
    }

    if (groups[0].label.toLowerCase() === groupName.toLowerCase()) {
        ctx.session.group = {
            name: groups[0].label,
            id:   groups[0].id
        }
        return await ctx.reply(`Group \`${groups[0].label}\` has been added to your account`, { parse_mode: "MarkdownV2" });
    }
    let inlineKeyboard = new InlineKeyboard()
    for (let i = 0; i < Math.min(groups.length, 3); i++) {
        inlineKeyboard = inlineKeyboard.text(groups[i].label, `setgroup-${groups[i].label}-${groups[i].id}`);
    }
    inlineKeyboard = inlineKeyboard.row().text('Cancel', `setgroup-cancel`)
    return await ctx.reply(`\`${groupName}\` hasn't been found\\. Did you mean this?`, { reply_markup: inlineKeyboard, parse_mode: "MarkdownV2" })
}

// Use setgroup conversation
bot.use(createConversation(setgroup))

bot.callbackQuery('setgroup-cancel', async ctx => {
    await ctx.editMessageText('You have canceled choosing your group. No group has been set.')
})

bot.callbackQuery(/^setgroup-(.+)$/, async ctx => {
    const [name, id] = ctx.callbackQuery.data.split('-').slice(1);
    ctx.session.group = {name, id}
    const text = `Group \`${name}\` has been added to your account`;
    await ctx.answerCallbackQuery({ text });
    await ctx.editMessageText(text, { parse_mode: "MarkdownV2" });
})

export default new Command({
    name: 'setgroup',
    description: 'Set your group that you belong to',
    middlewares: [
        async ctx => {
            await ctx.conversation.enter('setgroup');
        }
    ]
})

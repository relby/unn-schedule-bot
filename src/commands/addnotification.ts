import { InlineKeyboard, Keyboard } from "grammy";
import { bot } from "..";
import { Command } from "../classes/Command";
import { dateToTimeString } from "../helpers";
import { checkGroup } from "../middlewares";
import { InlineKeyboardButton, InputMessageContent } from 'typegram';
import { NotificationDay, TimeString } from "../typings/bot";
import assert from "assert";

const TIME_URL = 'https://expented.github.io/tgdtp/?hide=date&text=SELECT%20TIME:'

export default new Command({
    name: 'addnotification',
    description: 'Add notification time to get schedule',
    middlewares: [
        checkGroup,
        async ctx => {
            const setTimeButton = {
                text: 'Set time',
                web_app: {
                    url: TIME_URL,
                }
            }
            const inlineKeyboard = new InlineKeyboard()
                .text('This day', 'addnotification-today')
                .text('The day after', 'addnotification-tomorrow')
            await ctx.reply('What day do you want to get schedule of?', {
                reply_markup: inlineKeyboard
            })
        }
    ]
});

let day: NotificationDay;

bot.callbackQuery(/addnotification-(.+)/, async ctx => {
    switch ((ctx.match as RegExpMatchArray).splice(1)[0]) {
        case 'today':
            day = NotificationDay.Today;
            break;
        case 'tomorrow':
            day = NotificationDay.Tomorrow;
            break;
    }

    const keyboard = new Keyboard()
        .webApp('Set time', TIME_URL)
        .resized()
    await ctx.deleteMessage();
    await ctx.reply('Click the button below to configure time', {
        reply_markup: keyboard
    });

})

bot.on('message:web_app_data', async ctx => {
    assert(day !== null)
    const [ timestamp, timezoneOffset ] = ctx.message.web_app_data.data.split('_');

    const clientOffset = parseInt(timezoneOffset) * 60 * 1000
    const serverOffset = (new Date()).getTimezoneOffset() * 60 * 1000
    const offset = serverOffset - clientOffset

    const time: TimeString = dateToTimeString(new Date(parseInt(timestamp) + offset));
    console.log(time)
    if (!ctx.session.notifications.map(e => e.time).includes(time)) {
        ctx.session.notifications.push({
            day,
            time
        })
    }
    ctx.reply(`Notification time on ${time} has been set`, {
        reply_markup: {
            remove_keyboard: true
        }
    });
})

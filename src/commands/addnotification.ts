import { InlineKeyboard, Keyboard } from "grammy";
import { bot } from "..";
import { Command } from "../classes/Command";
import { dateToTimeString } from "../helpers";
import { checkGroup } from "../middlewares";
import { InputMessageContent } from 'typegram';
import { TimeString } from "../typings/bot";

const TIME_URL = 'https://expented.github.io/tgdtp/?hide=date'//&text=SELECT%20TIME:'

export default new Command({
    name: 'addnotification',
    description: 'Add notification time to get schedule',
    middlewares: [
        checkGroup,
        async ctx => {
            var setTimeButton = {
                text: 'Set time',
                web_app: {
                    url: TIME_URL,
                }
            }

            return await ctx.reply('Click the button below to configure time', { reply_markup: {
                    resize_keyboard: true,
                    keyboard: [
                        [setTimeButton]
                    ]
                }
            });
        }
    ]
});

bot.on('message:web_app_data', async ctx => {
    const [ timestamp ] = ctx.message.web_app_data.data.split('_');
    const time: TimeString = dateToTimeString(new Date(parseInt(timestamp)));
    if (!ctx.session.notificationTimings.includes(time)) {
        ctx.session.notificationTimings.push(time)
    }
    ctx.reply(`Notification time on ${time} set`, {
        reply_markup: {
            remove_keyboard: true
        }
    });
})

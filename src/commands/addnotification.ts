import { InlineKeyboard, Keyboard } from "grammy";
import { bot } from "..";
import { Command } from "../classes/Command";
import { checkGroup } from "../middlewares";
import { NotificationDay } from "../typings/bot";
import assert from "assert";
import { DateTime, FixedOffsetZone, Zone } from "luxon";

const TIME_URL = 'https://expented.github.io/tgdtp/?hide=date&text=SELECT%20TIME:'

export default new Command({
    name: 'addnotification',
    description: 'Add notification time to get schedule',
    middlewares: [
        checkGroup,
        async ctx => {
            const inlineKeyboard = new InlineKeyboard()
                .text('This day', 'addnotification-today')
                .text('The day after', 'addnotification-tomorrow')
            await ctx.reply('What day do you want to get schedule of?', {
                reply_markup: inlineKeyboard
            })
        }
    ]
});

let notificationDay: NotificationDay;

bot.callbackQuery(/addnotification-(.+)/, async ctx => {
    notificationDay = (ctx.match as RegExpMatchArray).splice(1)[0] as NotificationDay;
    const keyboard = new Keyboard()
        .webApp('Set time', TIME_URL)
        .resized()
    await ctx.deleteMessage();
    await ctx.reply('Click the button below to configure time', {
        reply_markup: keyboard
    });

})

bot.on('message:web_app_data', async ctx => {
    assert(notificationDay !== null)
    const [ timestampString, offsetUTCString ] = ctx.message.web_app_data.data.split('_');

    const timestamp = parseInt(timestampString);
    const offsetUTC = -parseInt(offsetUTCString);

    const dt = DateTime
        .fromMillis(timestamp)
        .setZone(FixedOffsetZone.instance(offsetUTC), { keepLocalTime: true });
    
    ctx.session.notifications.push({
        day: notificationDay,
        time: dt.toISOTime()
    })

    ctx.reply(`Notification time on ${dt.toLocaleString(DateTime.TIME_24_SIMPLE)} has been set`, {
        reply_markup: {
            remove_keyboard: true
        }
    });
})

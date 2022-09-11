import { InlineKeyboard } from "grammy";
import { DateTime } from "luxon";
import { bot } from "..";
import { Command } from "../classes/Command";
import { checkGroup } from "../middlewares";
import { Notification } from "../typings/bot";

const INTRO_MESSAGE = 'Click on the notifications that you want to delete:';
const NO_NOTIFICATIONS_MESSAGE = `You don't have any notifications. Add it with /addnotification command`

const createInlineKeyboard = (notifications: Notification[]) => {
    let inlineKeyboard = new InlineKeyboard()
    for (const { time } of notifications) {
        const dt = DateTime.fromISO(time);
        const timeString = dt.toLocaleString(DateTime.TIME_24_SIMPLE);
        inlineKeyboard = inlineKeyboard.text(
            timeString,
            `deletenotification-${timeString}`
        ).row();
    }
    // inlineKeyboard = inlineKeyboard.text('Cancel', 'deletenotification-cancel').row();
    return inlineKeyboard;
}


export default new Command({
    name: 'deletenotification',
    description: 'Pick your notifications that you want to delete',
    middlewares: [
        checkGroup,
        async ctx => {
            const { notifications } = ctx.session;
            if (notifications.length === 0) {
                return await ctx.reply(NO_NOTIFICATIONS_MESSAGE);
            }
            return await ctx.reply(INTRO_MESSAGE, { reply_markup: createInlineKeyboard(notifications) })
        }
    ]
})

// bot.callbackQuery('deletenotification-cancel', async ctx => {
//     const inlineKeyboard = new InlineKeyboard().text('Show notifications', 'deletenotification-open')
//     return await ctx.editMessageText('Notification delete menu is minimized', { reply_markup: inlineKeyboard })
// })

// bot.callbackQuery('deletenotification-open', async ctx => {
//     const { notificationTimings } = ctx.session;
//     if (notificationTimings.length === 0) {
//         return await ctx.editMessageText(NO_NOTIFICATIONS_MESSAGE);
//     }
//     return await ctx.editMessageText(INTRO_MESSAGE, { reply_markup: createInlineKeyboard(notificationTimings) })
// })

bot.callbackQuery(/^deletenotification-(.+)$/, async ctx => {
    const dt = DateTime.fromFormat(ctx.callbackQuery.data.split('-').slice(1)[0], "HH:mm");
    ctx.session.notifications = ctx.session.notifications.filter(e => {
        const notificationDt = DateTime.fromISO(e.time);
        return notificationDt.hour !== dt.hour || notificationDt.minute !== dt.minute;
    });
    await ctx.answerCallbackQuery(`Notification on ${dt.toLocaleString(DateTime.TIME_24_SIMPLE)} have been deleted`);
    if (ctx.session.notifications.length === 0) {
        return await ctx.editMessageText(NO_NOTIFICATIONS_MESSAGE);
    }
    return await ctx.editMessageText(INTRO_MESSAGE, { reply_markup: createInlineKeyboard(ctx.session.notifications)});
})

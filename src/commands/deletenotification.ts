import { InlineKeyboard } from "grammy";
import { bot } from "..";
import { Command } from "../classes/Command";
import { checkGroup } from "../middlewares";
import { MyContext, TimeString } from "../typings/bot";

const INTRO_MESSAGE = 'Click on the notifications that you want to delete:';
const NO_NOTIFICATIONS_MESSAGE = `You don't have any notifications. Add it with /addnotification command`

const createInlineKeyboard = (notificationTimings: TimeString[]) => {
    let inlineKeyboard = new InlineKeyboard()
    for (let i = 0; i < notificationTimings.length; i++) {
        inlineKeyboard = inlineKeyboard.text(notificationTimings[i], `deletenotification-${notificationTimings[i]}`).row();
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
            return await ctx.reply(INTRO_MESSAGE, { reply_markup: createInlineKeyboard(notifications.map(e => e.time)) })
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
    const [time] = ctx.callbackQuery.data.split('-').slice(1);
    ctx.session.notifications = ctx.session.notifications.filter(e => e.time !== time);
    await ctx.answerCallbackQuery(`Notification on ${time} have been deleted`);
    if (ctx.session.notifications.length === 0) {
        return await ctx.editMessageText(NO_NOTIFICATIONS_MESSAGE);
    }
    return await ctx.editMessageText(INTRO_MESSAGE, { reply_markup: createInlineKeyboard(ctx.session.notifications.map(e => e.time))});
})

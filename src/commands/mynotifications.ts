import { DateTime } from "luxon";
import { Command } from "../classes/Command";
import { checkGroup } from "../middlewares";

export default new Command({
    name: 'mynotifications',
    description: 'Show configured notifications',
    middlewares: [
        checkGroup,
        async ctx => {
            const { notifications } = ctx.session;
            if (notifications.length === 0) {
                return await ctx.reply(`You don't have any notifications. You can add it with /addnotification command`)
            }
            return await ctx.reply(notifications
                .map(e => `${DateTime.fromISO(e.time).toLocaleString(DateTime.TIME_24_SIMPLE)} ${e.day}`)
                .join('\n')
            )
        }
    ]
})

import { Command } from "../classes/Command";
import { checkGroup } from "../middlewares";

export default new Command({
    name: 'mynotifications',
    description: 'Show your notifications',
    middlewares: [
        checkGroup,
        async ctx => {
            const { notificationTimings } = ctx.session;
            return await ctx.reply(notificationTimings.join('\n'))
        }
    ]
})

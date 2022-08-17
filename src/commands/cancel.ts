import { bot } from '../bot';
import { Command } from '../classes/Command';

export default new Command({
    name: 'cancel',
    description: 'Cancel conversation',
    middlewares: [
        async ctx => {
            await ctx.conversation.exit();
        }
    ]
})

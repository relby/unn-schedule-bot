import { Command } from '../classes/Command';
import { checkGroup } from '../middlewares';

export default new Command({
    name: 'deletegroup',
    description: 'Delete your configured group',
    middlewares: [
        checkGroup,
        async ctx => {
            ctx.session.group = null;
            await ctx.reply('Your group have been deleted');
        }
    ]
})

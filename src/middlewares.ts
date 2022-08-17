import { CommandMiddleware } from 'grammy'
import { MyContext } from './typings/bot'

const NO_GROUP_MESSAGE = `You don't have your group configured. Use /setgroup command to add the group to your account`;

export const checkGroup: CommandMiddleware<MyContext> = async (ctx, next) => {
    const { group } = ctx.session;
    if (!group) {
        return await ctx.reply(NO_GROUP_MESSAGE);
    }
    next();
}

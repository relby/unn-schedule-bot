import { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import { Context, SessionFlavor } from "grammy";

type ISOTimeString = string;

export type NotificationDay = 
    | 'today'
    | 'tomorrow'

export interface Notification {
    time: ISOTimeString;
    day: NotificationDay;
}

export interface SessionData {
    group: {
        name: string;
        id: string;
    } | null;
    notifications: Notification[]
}

export type MyContext = Context & SessionFlavor<SessionData> & ConversationFlavor;
export type MyConversation = Conversation<MyContext>;

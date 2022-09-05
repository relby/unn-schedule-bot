import axios from "axios";
import { Lesson } from "./typings/api";
import { HH, MM, TimeString } from "./typings/bot";
const { API_URL } = process.env;

export const dateToParamsString = (date: Date): string => (
    `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
)

export const dateToTimeString = (date: Date): TimeString => (
    `${date.getHours().toString().padStart(2, '0') as HH}:${date.getMinutes().toString().padStart(2, '0') as MM}`
)

export const isValidTimeString = (str: string): boolean => {
    if (str.length !== 5) return false;
    if (!str.includes(':')) return false;
    const [hoursString, minutesString] = str.split(':')
    if (hoursString.length !== 2 || minutesString.length !== 2) return false;
    const [hours, minutes] = [hoursString, minutesString].map(parseInt)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return false;
    if (hours <= 0 || hours >= 24) return false;
    if (minutes <= 0 || minutes >= 60) return false;
    return true;
}

export const capitalize = (str: string): string => (
    str.charAt(0).toUpperCase() + str.slice(1)
)

export const lessonsByDate = async (groupId: string, date: Date): Promise<Lesson[]> => {
    const start = dateToParamsString(date);
    console.log(start)
    const lessons = (await axios.get(`${API_URL}/schedule/group/${groupId}`, {
        params: {
            start,
            finish: start
        }
    })).data as Lesson[];
    return lessons;
}

export const lessonsReplyByDate = async (groupId: string, date: Date): Promise<string> => {
    const lessons = await lessonsByDate(groupId, date);
    const now = new Date();
    let dateString: string;
    switch (date.getDate()) {
        case now.getDate():
            dateString = 'today'
            break;
        case now.getDate() + 1:
            dateString = 'tomorrow'
            break;
        default:
            dateString = date.toLocaleDateString()
    }
    if (lessons.length === 0) {
       return `There is no lessons ${dateString}`;
    }
    return `${capitalize(dateString)}:\n${lessons
        .map((lesson, i) => `${i+1}) ${lesson.beginLesson}-${lesson.endLesson} ${lesson.discipline} ${lesson.kindOfWork}`)
        .join('\n')}`
}

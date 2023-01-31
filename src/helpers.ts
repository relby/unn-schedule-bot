import axios from "axios";
import { Lesson } from "./typings/api";
import { DateTime } from "luxon";

export const API_URL = "https://portal.unn.ru/ruzapi";

export const capitalize = (str: string): string => (
    str.charAt(0).toUpperCase() + str.slice(1)
)

export const lessonsByDate = async (groupId: string, dt: DateTime): Promise<Lesson[]> => {
    const start = dt.toISODate().replace('-', '.');
    const lessons = (await axios.get(`${API_URL}/schedule/group/${groupId}`, {
        params: {
            start,
            finish: start
        }
    })).data as Lesson[];
    return lessons;
}

export const lessonsReplyByDate = async (groupId: string, dt: DateTime): Promise<string> => {
    const lessons = await lessonsByDate(groupId, dt);
    let dateString: string;
    if (dt.hasSame(DateTime.now(), 'day')) {
        dateString = 'today'
    } else if (dt.hasSame(DateTime.now().plus({ days: 1 }), 'day')) {
        dateString = 'tomorrow'
    } else {
        dateString = dt.toLocaleString({ month: 'long', day: 'numeric' })
    }

    if (lessons.length === 0) {
       return `There is no lessons ${dateString}`;
    }
    return `${capitalize(dateString)}:\n${lessons
        .map((lesson, i) => {
            const { beginLesson, endLesson, discipline, auditorium, kindOfWork } = lesson;
            return `${i+1}) ${beginLesson}-${endLesson} ${discipline} ${auditorium} ${kindOfWork}\n`
        })
        .join('\n')}`
}

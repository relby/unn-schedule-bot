import axios from "axios";
import { Lesson } from "./types";
const { API_URL } = process.env;

export const dateToParamsString = (date: Date): string => `${date.getFullYear()}.${(date.getMonth()).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`

export const lessonsByDate = async (groupId: string, date: Date): Promise<Lesson[]> => {
    const start = dateToParamsString(date);
    const lessons = (await axios.get(`${API_URL}/schedule/group/${groupId}`, {
        params: {
            start,
            finish: start
        }
    })).data as Lesson[];
    return lessons;
}
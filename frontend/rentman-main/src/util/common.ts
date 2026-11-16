import moment from "moment";

export function format(input: string) {
    if (input.length === 1) {
        return "0" + input;
    } else {
        return input;
    }
}

export function getDatesBetween(startDate?: Date | null, endDate?: Date | null): Date[] {
    if (startDate && endDate) {
        const dates: Date[] = [];
        let currentDate: Date = new Date(startDate);

        // Loop through each day until the end date
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate)); // Add the current date to the array
            currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
        }

        return dates;
    }

    return []
}

export function getFormatedDatesBetween(startDate?: Date | null, endDate?: Date | null): string[] {
    if (startDate && endDate) {
        const dates: string[] = [];
        let currentDate: Date = new Date(startDate);

        // Loop through each day until the end date
        while (currentDate <= endDate) {
            dates.push(moment(new Date(currentDate)).format('YYYY-MM-DD')); // Add the current date to the array
            currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
        }

        return dates;
    }

    return []
}

export function findMatchingDates(array1: Date[], array2: Date[]): boolean {
    // Convert dates to ISO strings for accurate comparison
    const array1Strings = array1.map(date => date.toISOString());
    const array2Strings = array2.map(date => date.toISOString());

    // Find matches
    const matches = array1Strings.filter(date => array2Strings.includes(date));

    // Convert back to Date objects
    return matches.map(dateString => new Date(dateString)).length === 0;
}

export function convertNumbersToFloat(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(convertNumbersToFloat);
    } else if (obj !== null && typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            const value = obj[key];
            if (typeof value === 'number') {
                result[key] = parseFloat(value.toString());
            } else {
                result[key] = convertNumbersToFloat(value);
            }
        }
        return result;
    }
    return obj;
}

export function formatTimeArrayForInput(time?: Array<number | string>): string {
    if (!time || time.length < 2) {
        return "";
    }

    const hours = Number(time[0]);
    const minutes = Number(time[1]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return "";
    }

    return `${format(String(hours))}:${format(String(minutes))}`;
}

export function formatTimeArrayToString(time?: Array<number | string>): string {
    if (!time || time.length < 2) {
        return "";
    }

    const hours = Number(time[0]);
    const minutes = Number(time[1]);
    const seconds = time.length > 2 ? Number(time[2]) : 0;

    if ([hours, minutes, seconds].some(Number.isNaN)) {
        return "";
    }

    return `${format(String(hours))}:${format(String(minutes))}:${format(String(seconds))}`;
}

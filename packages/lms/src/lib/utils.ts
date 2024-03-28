import { type ClassValue, clsx } from "clsx";
import { addDay, dayStart, isAfter, isBefore, sameDay } from "@formkit/tempo";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isTruthy<T>(
  val: T
): val is Exclude<T, false | undefined | "" | null> {
  return Boolean(val) || val === 0;
}

export const layoutPages = {
  admin: ["settings", "users", "holidays", "integrations"],
  catalog: ["collections", "items"],
  circulation: ["checkout", "checkin", "holds", "policies"],
  imports: ["items", "patrons"],
  patrons: ["individuals", "groups"],
} as const;
export const lastSeenSchema = z.record(
  z.string(),
  z.object({
    admin: z
      .object({
        page: z.enum(layoutPages.admin),
        queries: z.object({
          holidays: z.string().optional(),
          integrations: z.string().optional(),
          settings: z.string().optional(),
          users: z.string().optional(),
        }),
      })
      .optional(),
    catalog: z
      .object({
        page: z.enum(layoutPages.catalog),
        queries: z.object({
          collections: z.string().optional(),
          items: z.string().optional(),
        }),
      })
      .optional(),
    circulation: z
      .object({
        page: z.enum(layoutPages.circulation),
        queries: z.object({
          checkin: z.string().optional(),
          checkout: z.string().optional(),
          holds: z.string().optional(),
          policies: z.string().optional(),
        }),
      })
      .optional(),
    imports: z
      .object({
        page: z.enum(layoutPages.imports),
        queries: z.object({
          items: z.string().optional(),
          patrons: z.string().optional(),
        }),
      })
      .optional(),
    patrons: z
      .object({
        page: z.enum(layoutPages.patrons),
        queries: z.object({
          groups: z.string().optional(),
          individuals: z.string().optional(),
        }),
      })
      .optional(),
  })
);

export function parseLastSeenCookieValue(val: string | undefined) {
  if (val) {
    try {
      const obj = JSON.parse(val);
      return lastSeenSchema.parse(obj);
    } catch {
      console.error("Invalid last seen cookie value.");
    }
  }
  return {} as z.infer<typeof lastSeenSchema>;
}

export function dateIsOnHoliday(
  date: Date,
  holiday: { date: string; toDate: string | null }
) {
  return Boolean(
    sameDay(date, holiday.date) ||
      (holiday.toDate &&
        (sameDay(date, holiday.toDate) ||
          (isAfter(date, holiday.date) && isBefore(date, holiday.toDate))))
  );
}

export function entriesAsObjs<T extends object>(obj: T) {
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value,
  })) as EntryObjs<T>;
}

export type EntryObjs<T extends object> = Array<
  Required<{
    [K in keyof T]: { key: K; value: Required<T>[K] };
  }>[keyof T]
>;

export function entries<T extends object>(obj: T) {
  return Object.entries(obj) as Entries<T>;
}

export type Entries<T extends object> = Array<
  Required<{
    [K in keyof T]: [K, Required<T>[K]];
  }>[keyof T]
>;

export function diffInNonHolidays(
  dateLeft: Date,
  dateRight: Date,
  holidays: Array<{ date: string }>
) {
  const _dateLeft = new Date(dateLeft);
  let _dateRight = new Date(dateRight);

  const calendarDifference = differenceInCalendarDays(_dateLeft, _dateRight);
  const sign = calendarDifference < 0 ? -1 : 1;

  const weeks = Math.trunc(calendarDifference / 7);

  let result = weeks * 5;
  _dateRight = addDay(_dateRight, weeks * 7);

  // the loop below will run at most 6 times to account for the remaining days that don't makeup a full week
  while (!sameDay(_dateLeft, _dateRight)) {
    // sign is used to account for both negative and positive differences
    result +=
      isWeekend(_dateRight) ||
      holidays.some((holiday) => sameDay(new Date(holiday.date), _dateRight))
        ? 0
        : sign;
    _dateRight = addDay(_dateRight, sign);
  }

  // Prevent negative zero
  return result === 0 ? 0 : result;
}

export function getDueDate(input: {
  exclude_holidays_weekends: boolean;
  holidays: Array<{ date: string }>;
  limit: number;
}) {
  let dueDate = dayStart(new Date());
  if (!input.exclude_holidays_weekends) {
    dueDate = addDay(dueDate, input.limit);
    return dueDate;
  }

  let daysRemaining = input.limit;
  while (daysRemaining > 0) {
    dueDate = addDay(dueDate, 1);
    if (
      !isWeekend(dueDate) &&
      !input.holidays.some((holiday) =>
        sameDay(new Date(holiday.date), dueDate)
      )
    ) {
      daysRemaining--;
    }
  }

  return dueDate;
}

export function differenceInCalendarDays(
  _dateLeft: Date,
  _dateRight: Date
): number {
  throw new Error("Function not implemented.");
}

export function isWeekend(_dateRight: Date): boolean {
  throw new Error("Function not implemented.");
}

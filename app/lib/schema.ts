import {
  object,
  string,
  optional,
  pipe,
  regex,
  minLength,
  transform,
  number,
  type InferIssue,
  getDotPath,
  type BaseIssue,
  custom,
  check,
  forward,
} from "valibot";
import { calculateDuration } from "./timeStrings";

export const TimeSchema = pipe(
  string(),
  regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (expected HH:mm)"),
);

export type TimeIssue = InferIssue<typeof TimeSchema>;

export const DateSchema = pipe(
  string(),
  regex(
    /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/,
    "Invalid date format (expected yyyyMMdd)",
  ),
);

export const EntryFormSchema = pipe(
  object({
    start: TimeSchema,
    end: TimeSchema,
    project: pipe(string(), minLength(1)),
    activity: optional(string()),
    description: pipe(string(), minLength(1)),
    date: DateSchema,
    entryIndex: pipe(
      string(),
      regex(/^\d+$/, "Entry index must be a string with a number"),
      transform(Number),
      number(),
    ),
  }),
  forward(
    check(
      ({ start, end }) => calculateDuration(start, end) > 0,
      "Negative time detected",
    ),
    ["end"],
  ),
);

export type EntryFormIssue = InferIssue<typeof EntryFormSchema>;

export function findIssueByPath<
  T extends Array<BaseIssue<unknown>> | undefined,
>(issues: T, dotPath: string) {
  return issues?.find((issue) => getDotPath(issue) === dotPath);
}

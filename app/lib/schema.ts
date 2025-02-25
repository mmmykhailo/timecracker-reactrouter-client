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
  trim,
  maxLength,
  check,
} from "valibot";
import { calculateDuration } from "./time-strings";

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
    time: pipe(
      object({
        start: TimeSchema,
        end: TimeSchema,
      }),
      check(
        ({ start, end }) => calculateDuration(start, end) > 0,
        "Negative time detected",
      ),
    ),
    project: pipe(string(), trim(), minLength(1), maxLength(32), regex(/^[A-Za-z0-9]+$/, 'Project should be alphanumeric')),
    activity: optional(pipe(string(), trim(), maxLength(32))),
    description: pipe(string(), trim(), minLength(1), maxLength(256)),
    date: DateSchema,
    entryIndex: pipe(
      string(),
      regex(/^\d+$/, "Entry index must be a string with a number"),
      transform(Number),
      number(),
    ),
  }),
);

export type EntryFormIssue = InferIssue<typeof EntryFormSchema>;

export function findIssueByPath<
  T extends Array<BaseIssue<unknown>> | undefined,
>(issues: T, dotPath: string) {
  return issues?.find((issue) => getDotPath(issue) === dotPath);
}

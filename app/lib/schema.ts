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
} from "valibot";

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
const datePattern = /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/;

export const EntryFormSchema = object({
  start: pipe(
    string(),
    regex(timePattern, "Invalid time format (expected HH:mm)"),
  ),
  end: pipe(
    string(),
    regex(timePattern, "Invalid time format (expected HH:mm)"),
  ),
  project: pipe(string(), minLength(1)),
  activity: optional(string()),
  description: pipe(string(), minLength(1)),
  date: pipe(
    string(),
    regex(datePattern, "Invalid date format (expected yyyyMMdd)"),
  ),
  entryIndex: pipe(
    string(),
    regex(/^\d+$/, "Entry index must be a string with a number"),
    transform(Number),
    number(),
  ),
});

export type EntryFormIssue = InferIssue<typeof EntryFormSchema>;

export function findIssueByPath<
  T extends Array<BaseIssue<unknown>> | undefined,
>(issues: T, dotPath: string) {
  return issues?.find((issue) => getDotPath(issue) === dotPath);
}

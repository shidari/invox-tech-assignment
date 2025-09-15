import * as v from "valibot";

export const isoTimestampSchema = v.pipe(
  v.string(),
  v.isoTimestamp("The timestamp is badly formatted."),
  v.brand("<iso-timestamp>"),
);

import * as v from "valibot";

export const classIdParamSchema = v.object({
  classId: v.pipe(
    v.string(),
    v.transform((s) => Number(s)),
    v.number(),
  ),
});

export const classIdSuccessResponseSchema = v.object({
  classId: v.number(),
  label: v.string(),
});

export const classesSuccessResponseSchema = v.array(
  classIdSuccessResponseSchema,
);

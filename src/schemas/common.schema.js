//@ts-ignore
import { z } from "zod";

export const idValidation = z
  .string()
  .refine((data) => !Number.isNaN(Number(data)), "ID must be a numeric value")
  .transform(Number)
  .refine((num) => num > 0, "ID must be a positive number");

export const idSchema = z.object({
  params: z.object({ id: idValidation }),
});


export const stringIdValidation = z.string().min(6, "Id should be least 6 characters long")
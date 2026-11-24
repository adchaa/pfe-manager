import z from "zod"

export const signupSchema = z.object({
  firstName: z.string().min(1, "The first name is required"),
  lastName: z.string().min(1, "The last name is required"),
  email: z.email("invalid Email"),
  password: z
    .string()
    .min(6, "The password must contain at least 6 characters"),
  role: z.enum(["ETUDIANT", "ENCADRANT_ENTREPRISE", "ENCADRANT_UNIVERSITAIRE"]),
})
export type TsignupSchema = z.infer<typeof signupSchema>

export const loginSchema = z.object({
  email: z.email("invalid Email"),
  password: z.string().min(1, "The password is required"),
})
export type TloginSchema = z.infer<typeof loginSchema>

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})
export type TrefreshTokenSchema = z.infer<typeof refreshTokenSchema>

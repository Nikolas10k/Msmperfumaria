import { z } from "zod";

const email = z.email({ message: "E-mail inválido." });

const password = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .regex(/[a-zA-Z]/, "A senha precisa ter pelo menos uma letra.")
  .regex(/[0-9]/, "A senha precisa ter pelo menos um número.");

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Informe seu nome.").max(120),
    email,
    phone: z.string().trim().max(20).optional(),
    password,
    confirmPassword: z.string(),
    consent: z.literal(true, {
      message: "É preciso aceitar os Termos e a Política de Privacidade.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe sua senha."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

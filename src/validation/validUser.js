import { z } from "zod"

export const userAuthSchema = z.object({
    name: z.string().min(4),
    email: z.string().email(),
    password: z.string().min(8),

})
import { z } from "zod"

export const matchCreateSchema = z.object({
    matchId: z.string().optional(),

    sport: z.string().min(1),
    homeTeam: z.string().min(1),
    awayTeam: z.string().min(1),
    homeScore: z.number().int().nonnegative().optional(),
    awayScore: z.number().int().nonnegative().optional(),


})

export const matchUpdateSchema = z.object({
    homeScore: z.number().int().nonnegative().optional(),
    awayScore: z.number().int().nonnegative().optional(),

})
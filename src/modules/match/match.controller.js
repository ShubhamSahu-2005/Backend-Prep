import { z } from "zod"
import { match } from "./../../models/match.js"
import { matchCreateSchema, matchUpdateSchema } from "./../../validation/validMatch.js"


export const createMatch = async (req, res, next) => {
    const parsed = matchCreateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid Payload",
            errors: parsed.error.errors
        })
    }
    const { matchId, sport, homeTeam, awayTeam, homeScore, awayScore } = parsed.data;
    try {
        if (matchId) {
            const existing = await match.findOne({ matchId });
            if (existing) {
                return res.status(400).json({
                    message: "Match Already Exists"
                })
            }
        }
        const newmatch = await match.create({
            matchId,
            sport,
            homeTeam,
            awayTeam,
            homeScore,
            awayScore,
        })

        return res.status(201).json({
            message: "Match Created",
            newmatch
        })
    }
    catch (err) {
        next(err)

    }


}
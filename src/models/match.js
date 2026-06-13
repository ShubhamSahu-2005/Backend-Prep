import { MongoTailableCursorError } from "mongodb";
import mongoose from "mongoose";
import crypto from "crypto";


const matchSchema = new mongoose.Schema({
    matchId: {
        type: String,
        default: () => crypto.randomUUID(),

        unique: true,


    },
    sport: {
        type: String,
        required: true,

    },
    homeTeam: {
        type: String,
        required: true,
    },
    awayTeam: {
        type: String,
        required: true,
    },
    homeScore: {
        type: Number,
        required: true, default: 0
    }, awayScore: {
        type: Number,
        required: true, default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now

    }
})
export const match = mongoose.model("match", matchSchema)
import mongoose from "mongoose";
const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

    },
    expiresAt: {
        type: Date,
        required: true,
    }


});
export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema)
import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,

    },
    completed: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",

    },
    createdAt: {
        type: Date,
        default: Date.now(),

    }
})
export const Todo = mongoose.model("Todo", todoSchema);
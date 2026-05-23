import mongoose from "mongoose";
import { Todo } from "../../models/Todo.js";
import { User } from "../../models/User.js";


// CREATE TODO
export const createTodo = async (req, res, next) => {
    try {

        const { userId, title, description } = req.body;

        if (!userId || !title || !description) {
            const error = new Error("All fields are required");
            error.statusCode = 400;
            return next(error);
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            const error = new Error("Invalid User Id");
            error.statusCode = 400;
            return next(error);
        }

        const user = await User.findById(userId);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }

        const todo = await Todo.create({
            userId,
            title,
            description,
        });

        return res.status(201).json({
            success: true,
            message: "Todo created successfully",
            todo,
        });

    } catch (err) {
        next(err);
    }
};



// UPDATE TODO
export const updateTodo = async (req, res, next) => {
    try {

        const { todoId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(todoId)) {
            const error = new Error("Invalid Todo Id");
            error.statusCode = 400;
            return next(error);
        }

        const todo = await Todo.findById(todoId);

        if (!todo) {
            const error = new Error("Todo not found");
            error.statusCode = 404;
            return next(error);
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
            todoId,
            req.body,
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Todo updated successfully",
            todo: updatedTodo,
        });

    } catch (err) {
        next(err);
    }
};



// DELETE TODO
export const deleteTodo = async (req, res, next) => {
    try {

        const { todoId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(todoId)) {
            const error = new Error("Invalid Todo Id");
            error.statusCode = 400;
            return next(error);
        }

        const todo = await Todo.findById(todoId);

        if (!todo) {
            const error = new Error("Todo not found");
            error.statusCode = 404;
            return next(error);
        }

        await Todo.findByIdAndDelete(todoId);

        return res.status(200).json({
            success: true,
            message: "Todo deleted successfully",
        });

    } catch (err) {
        next(err);
    }
};



// GET ALL TODOS
export const getAllTodos = async (req, res, next) => {
    try {

        const todos = await Todo.find();

        return res.status(200).json({
            success: true,
            message: "Todos fetched successfully",
            todos,
        });

    } catch (err) {
        next(err);
    }
};



// GET TODO BY ID
export const getTodoById = async (req, res, next) => {
    try {

        const { todoId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(todoId)) {
            const error = new Error("Invalid Todo Id");
            error.statusCode = 400;
            return next(error);
        }

        const todo = await Todo.findById(todoId);

        if (!todo) {
            const error = new Error("Todo not found");
            error.statusCode = 404;
            return next(error);
        }

        return res.status(200).json({
            success: true,
            message: "Todo fetched successfully",
            todo,
        });

    } catch (err) {
        next(err);
    }
};
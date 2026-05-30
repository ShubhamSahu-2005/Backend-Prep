import { Router } from "express";

import { createTodo, updateTodo, deleteTodo, getAllTodos, getTodoById } from "./todo.controller.js";

export const todoRoutes = Router();
todoRoutes.post('/create-todo', createTodo);
todoRoutes.put('/update-todo/:todoId', updateTodo);
todoRoutes.delete('/delete-todo/:todoId', deleteTodo);
todoRoutes.get('/get-all-todo', getAllTodos);
todoRoutes.get('/get-todo-ById/:todoId', getTodoById);
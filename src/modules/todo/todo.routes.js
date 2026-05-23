import { Router } from "express";

import { createdTodo, updateTodo, deletedTodo, getAlltodo, getTodobyId } from "./todo.controller.js";

export const router = Router();
router.post('/create-todo', createdTodo);
router.put('/update-todo/:todoId', updateTodo);
router.delete('/delete-todo/:todoId', deletedTodo);
router.get('/get-all-todo', getAlltodo);
router.get('/get-todo-ById/:todoId', getTodobyId)
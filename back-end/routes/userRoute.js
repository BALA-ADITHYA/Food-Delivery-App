import express from 'express';
import { loginUser,resisterUser } from '../controllers/userController.js';


const userRouter = express.Router()

userRouter.post("/resister",resisterUser)
userRouter.post("/login",loginUser)


export default userRouter
import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'
import { response } from "express";

// login user

const loginUser = async (req,res)=>{

    const {email,password} = req.body;
    try{
        const user = await userModel.findOne({email});
        if(!user){
          return  res.json({success:false,message:'User Doesnot exit'})
        }
        const isMatch =await bcrypt.compare(password,user.password)
        if(!isMatch){
         return   res.json({success:false,message:"invalid password"})
        }
        const token = createToken(user._id)
        res.json({success:true,token})
        

    }catch(error){
        console.log(error)
        res.json({success:false,message:"Error"})
    }
}

    const createToken = (id)=>{

        return jwt.sign({id},process.env.JWT_SECRET)
    }
//resister user

const resisterUser = async (req,res)=>{

    const {name,password,email} = req.body;
    try{
        //checking if user alreay exist
        const exists = await userModel.findOne({email});
        if(exists){
            return res.json({success:false,message:'User alreay Exist'})
        }
        // validtaing email format and storng password
        if(!validator.isEmail(email)){
                return res.json({success:false,message:"Please enter Valid Email"})
        }
        //password length checking
        if(password.length < 8){
            return res.json({success:false,message:'Please enter storng Password'})
        }

        //hasing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new userModel({
            name:name,
            email:email,
            password:hashedPassword,
        })

        const user = await newUser.save()

        const token = createToken(user._id)
        response.json({success:true,token})

    }catch(error){
        console.log(error)
        response.json({message:error})
    }
}


export{resisterUser,loginUser}
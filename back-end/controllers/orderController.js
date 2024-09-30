import orderModel from './../models/orderModel.js';
import userModel from './../models/userModel.js';
import Stripe from 'stripe'


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//placing user order for frontend

const placeOrder = async (req,res) =>{

    const frontend_url = 'https://food-delivery-frontend-i3e5.onrender.com';
    
    try{
        const newOrder = new orderModel({
            userId:req.body.userId,
            item:req.body.items,
            amount:req.body.amount,
            address:req.body.address
        })
        await newOrder.save()
        await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}})
        const line_items = req.body.items.map((item)=>({
            price_data: {
                currency:"inr",
                product_data:{
                    name:item.name
                },
                unit_amount:item.price*100*80
            },
            quantity:item.quantity,
        }))

        line_items.push({
            price_data:{
                currency:"inr",
                product_data:{name:"delivery Charges"},
                unit_amount:2*100*80
            },
            
            quantity:1
        })

        const session = await stripe.checkout.sessions.create({
            line_items:line_items,
            mode:"payment",
            success_url:`https://food-delivery-frontend-i3e5.onrender.com/verify?success=true&session_id={CHECKOUT_SESSION_ID}&orderId=${newOrder._id}`,
            cancel_url:`https://food-delivery-frontend-i3e5.onrender.com/verify?success=false&session_id={CHECKOUT_SESSION_ID}&orderId=${newOrder._id}`,
        })

        res.json({success:true,session_url:session.url})
      
    }catch(error){
        console.log(error);
        res.json({success:false,message:'Error'})
    }
}

const verifyOrder = async (req,res)=>{
    const {orderId,success} = req.body;
    console.log(orderId,success)
    try{
        if(success=="true"){
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"paid"});
        }else{
            await orderModel.findByIdAndDelete(orderId)
            res.json({success:false,message:"Not Paid"})
            
        }
    }catch(error){
      
       res.json({success:false,message:error})
    }
}

// user order for frontend

const userOrders = async (req,res)=>{

    try{
        const orders = await orderModel.find({userId:req.body.userId})
        res.json({success:true,data:orders})
    }catch(error){
        console.log(error)
    res.json({success:false,message:'Error'})
    }
}

//list orders

const listOrders = async (req,res) =>{

    try{
        const orders = await orderModel.find({})
        res.json({success:trur,data:orders})
    }catch(error){
        console.log(error)
        res.json({success:false,message:'Error'})
    }
}

//api for updating order status

const updateStatus = async (req,res) =>{
    try{
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
        res.json({success:true,message:'Status Updated'})
    }catch(error){
        console.log(error)
        res.json({success:false,message:'Error'})
    }

}

export  {placeOrder,verifyOrder,userOrders,listOrders,updateStatus}

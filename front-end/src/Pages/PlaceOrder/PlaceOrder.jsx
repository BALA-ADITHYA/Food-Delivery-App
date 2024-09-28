import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Contexts/StoreContext'
import { food_list } from './../../assets/assets';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PlaceOrder = () => {

  const {getTotalCartAmount,token,food_list,cardItems,url} = useContext(StoreContext)

  const [data,setData] = useState({
    firstname:"",
    lastname:"",
    email:"",
    street:"",
    city:"",
    state:"",
    zipcode:"",
    country:"",
    phone:""

  })


  const onChangrHandler = (event)=>{
    const name = event.target.name;
    const value = event.target.value;
     setData(data=>({...data,[name]:value}))
  }

  const placeOrder = async (event)=>{
      event.preventDefault()
      let orderItems = [];
      food_list.map((item)=>{
        if(cardItems[item._id]>0){
          let itemInfo = item;
          itemInfo["quantity"]= cardItems[item._id];
          orderItems.push(itemInfo)
         
        }
      })


     
      let orderData = {
        address:data,
        items:orderItems,
        amount:getTotalCartAmount()+2,

      }
     

      let response = await axios.post(url+"/api/order/place",orderData,{headers:{token}});
      if (response.data.success){
        const {session_url} = response.data;
        window.location.replace(session_url)
      }
      else{
        alert("Error")
      }
  }


    const navigate = useNavigate()
  useEffect(()=>{
    if(!token){
      navigate('/cart')
    }
    else if(getTotalCartAmount()===0){
      navigate('/cart')
    }
  },[token])

  return (
    <form onSubmit={placeOrder} className='place-order' >
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>
        <div className="multi-fields">
          <input required  onChange={onChangrHandler} name='firstname' value={data.firstname} type="text" placeholder='First Name' />
          <input required onChange={onChangrHandler} name='lastname' value={data.lastname} type="text" placeholder='Last Name' />
        </div>
        <input required  type="email" name='email' value={data.email} onChange={onChangrHandler} placeholder='Email' />
        <input required name='street' value={data.street} onChange={onChangrHandler}  type="text" placeholder='street' />
        <div className="multi-fields">
          <input required name='city' value={data.city} onChange={onChangrHandler} type="text" placeholder='city' />
          <input required name='state' value={data.state} onChange={onChangrHandler} type="text" placeholder='state' />
        </div>
         <div className="multi-fields">
          <input required  onChange={onChangrHandler} name='zipcode' value={data.zipcode} type="text" placeholder='Zip code' />
          <input required  onChange={onChangrHandler} name='country' value={data.country} type="text" placeholder='Country' />
        </div>
        <input required onChange={onChangrHandler} name='phone' value={data.phone} type="phone" placeholder='Phone' />
      </div>

      <div className="place-order-right">
      <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${getTotalCartAmount()===0 ? 0 :2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${getTotalCartAmount()===0 ? 0 : getTotalCartAmount()+2}</b>
            </div>
          </div>
            <button type='submit' >PROCEED TO PAYMENT</button>
        </div>
        
      </div>
    </form>
  )
}

export default PlaceOrder

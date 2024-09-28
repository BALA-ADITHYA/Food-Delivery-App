import { createContext, useEffect, useState } from 'react'
import axios from 'axios'



export const StoreContext = createContext(null)

const StoreContextProvider =  (props) => {

  const [cardItems, setCardItems] = useState({})
  const url = "https://food-delivery-backend-gqpr.onrender.com";
  const [token,setToken] = useState("");

  const [food_list,setFoodlist] = useState([])

  const addToCard = async(itemId) => {
    if (!cardItems[itemId]) {
      setCardItems((prev) => ({ ...prev, [itemId]: 1 }))
    } else {
      setCardItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }))
    }
    if(token){
      await axios.post(url+"/api/cart/add",{itemId},{headers:{token}})
    }
  }

  const removeFromCard = async (itemId) => {
    setCardItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
    if(token){
      await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}})
    }
  }

  const getTotalCartAmount = () => {
    let totalAmount = 0
    for (const item in cardItems) {
      if (cardItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item)
        totalAmount += itemInfo.price * cardItems[item]
      }
    }
    return totalAmount
  }

  const fetchFoodList = async ()=>{
    
    const response = await axios.get(url+"/api/food/list");
    
    setFoodlist(response.data.data)
  }
  
  const loadCartData = async (token)=>{
    const response = await axios.post(url+"/api/cart/get",{},{headers:{token}});
   
    setCardItems(response.data.cartData)
  }


  useEffect(()=>{
    async function loadData(){
      await fetchFoodList()
      if(localStorage.getItem("token")){
        setToken(localStorage.getItem("token"));
        await loadCartData(localStorage.getItem("token"))
      }
    }
      loadData();
   
  },[])
  
  
  const contextValue = {
    food_list,
    cardItems,
    setCardItems,
    addToCard,
    removeFromCard,
    getTotalCartAmount,url,token,setToken
  }

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  )
}

export default StoreContextProvider

import React, {useState } from 'react';
const useToast=()=>{
  const toastDefault = {show:false,message:''}
  const [toastData,setToastData] = useState(toastDefault)
  
  const closeToast = (closeeFn,bool)=>{
    setToastData({...toastData,show:false})
    closeeFn(bool)
  }
  const addMessage = (msg)=>{
    setToastData({show:true,message:msg})
  }

  return [toastData,addMessage,closeToast]
}
export default useToast


import dayjs from 'dayjs'

export const sortName=(list)=>{
  const copyArr = [...list]
  const compare = (a,b)=>{
      return ((a < b) ? -1 : ((a > b )? 1 : 0))
  }
  copyArr.sort((a,b)=>compare(a.firstName.toLowerCase(),b.firstName.toLowerCase()))
  return copyArr

}
export const sortAmount=(list)=>{
  const copyArr = [...list]
  const compare = (a,b)=>{
      return ((a < b) ? 1 : ((a > b )? -1 : 0))
  }
  copyArr.sort((a,b)=>compare(a.monthlyContribution,b.monthlyContribution))
  return copyArr

}
export const sortCreation=(list,type=1)=>{
  const copyArr = [...list]
  const compare = (a,b)=>{
      if(type === 1){
          return ((dayjs(a).isBefore(b)) ? -1 : ((dayjs(a).isAfter(b) )? 1 : 0))
      }else{
          return ((dayjs(a).isBefore(b)) ? 1 : ((dayjs(a).isAfter(b) )? -1 : 0))
      }
  }
  copyArr.sort((a,b)=>compare(a.createdAt.toDate(),b.createdAt.toDate()))
  return copyArr
}
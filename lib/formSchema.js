import * as Yup from 'yup'
import dayjs from 'dayjs'
import customFormError from './customFormError'
const isDividedBy1000 = (num)=>{
  if(num < 1000 || isNaN(1000)) return false
  return(num%1000===0)?true:false
}
const regEx = {
  names:/^[A-Za-z()-]+$/,
  fullName:/^[A-Za-z()-\s]+$/,
  digits:/^[\d()+-]+$/,
  address:/^[A-Za-z\s\d()-,.]+$/,
  profession:/^[A-Za-z\d]+$/,
} 

const lessDetails='please reduce the details'
const missingError=(field,prefix = "your")=>(`please fill ${prefix} ${field}`)
const lengthError=(field,isShort = true)=>(`your ${field} is too ${isShort?'short':'long'}`)
export const adminSchema = Yup.object().shape({
  email: Yup.string()
    .required(missingError('username'))
    .trim()
    .email('a valid email is required')
    .lowercase(),
  password: Yup.string()
    .required(missingError('password'))
})
const schema = Yup.object().shape({
  firstName: Yup.string()
    .required(missingError('first name')).min(2,lengthError('name'))
    .max(30,lengthError('name',false))
    .matches(regEx.names,customFormError.invalidText)
    .trim()
    .lowercase(),
  lastName: Yup.string()
    .required(missingError('last name'))
    .min(2,lengthError('name'))
    .max(30,lengthError('name',false))
    .matches(regEx.names,customFormError.invalidText)
    .trim()
    .lowercase(),
  middleName: Yup.string()
    .optional()
    .min(2,lengthError('name'))
    .max(30,lengthError('name',false))
    .matches(regEx.names,customFormError.invalidText)
    .trim()
    .lowercase(),
  email: Yup.string()
    .required(missingError('E-mail'))
    .email('please use a valid E-mail')
    .trim()
    .lowercase(),
  phone: Yup.string()
    .required(missingError('phone number'))
    .min(6,'invalid phone number')
    .max(30,'invalid phone number')
    .matches(regEx.digits,'invalid phone number'),
  otherPhone: Yup.string()
    .optional()
    .min(6,'invalid phone number')
    .max(30,'invalid phone number')
    .matches(regEx.digits,'invalid phone number'),
  gender: Yup.string()
    .required(missingError('gender','a'))
    .oneOf(['M','F'], 'invalid input'),
  dateOfBirth:Yup.date('invalid input')
    .required('date of birth is required')
    .max(dayjs(),'invalid date selected'),
  homeAddress: Yup.string()
    .required(missingError('home address'))
    .min(2,'the name is too short')
    .max(130,lessDetails)
    .matches(regEx.address,customFormError.invalidAddress)
    .trim(),
  NextOfKin: Yup.string()
    .required(missingError('Next of Kin','a'))
    .min(2,missingError('details','more'))
    .max(50,lessDetails)
    .matches(regEx.fullName,customFormError.invalidText)
    .trim()
    .lowercase(),
  NextOfKinEmail: Yup.string()
    .optional()
    .email('please use a valid E-mail')
    .trim()
    .lowercase(),
  NextOfKinPhoneNumber: Yup.string()
    .required(missingError('phone number','your spouse/next of kin\'s'))
    .min(6,'invalid phone number')
    .matches(regEx.digits,'invalid phone number'),
  workAddress: Yup.string()
    .required(missingError('work address'))
    .min(2,missingError('details','more'))
    .max(130,lessDetails)
    .matches(regEx.address,customFormError.invalidAddress)
    .trim(),
  profession: Yup.string()
    .required(missingError('current profession'))
    .min(2,missingError('details','more'))
    .max(45,lessDetails)
    .matches(regEx.profession,customFormError.invalidText)
    .trim()
    .lowercase(),
  monthlyContribution: Yup.number()
    .required(missingError('amount','an'))
    .positive('invalid number')
    .integer('invalid number')
    .moreThan(999,'amount is too low')
    .test('isDividedBy1000','amount must be divisible by 1000',(value)=>isDividedBy1000(value)),
  passport: Yup.mixed()
    .required('upload a passport photograph')
})
export default schema
import {useState} from 'react'
import Head from 'next/head'
import Image from 'next/image'

import {Formik,useFormikContext } from 'formik'
import { useAutoAnimate } from '@formkit/auto-animate/react'

import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'

import dayjs from 'dayjs'

import {ref,uploadBytes,getDownloadURL } from 'firebase/storage'
import { collection,addDoc,serverTimestamp  } from 'firebase/firestore' 

import schema from '../lib/formSchema'
import DisplayToast from '../lib/displayToast'

import customFormError from '../lib/customFormError'
import {InputBootstrap,SelectBootstrap,InputPassport} from '../components/inputs'
import {storage,dbStore} from '../components/firebase'
import useToast from '../hooks/useToast' 

import { v4 as uuidv4 } from 'uuid'

export default function Home() {
  const [toastData,addMessage,closeToast] = useToast()
  const [dateData,setDateData] = useState(dayjs('01-01-1970').format('YYYY-MM-DD'))
  const [isLoading, setLoading] = useState(false);
  const [isSubmitted,setIsSubmitted] = useState(false)
  const [animateParent] = useAutoAnimate()
  const changeDate = (e)=>{
    setDateData(e.target.value)
    console.log('date',dateData)
  }
  const OptionalInfo = ()=>(
    <p style={{fontSize:"12px"}}>* are optional fields</p>
  )
  

  //neo4j
  //mDZrZLxnBlZKinMlNvrXgql1QKlMCM9QVHmpsxo_QQQ
  
  const submitForm = async (values)=>{
    if(isLoading){
      return
    }
    setLoading(true)
    console.log('person',{...values,createdAt:serverTimestamp()}) 
    const {passport} = values
    if(!passport){
      addMessage(customFormError.type)
      return
    }
    if(!passport.type.includes('image/')){
      addMessage(customFormError.type)
      return
    }
    if(passport.size > (3 * 1048576)){
      addMessage(customFormError.size)
      return
    }
    const imageRef = ref(storage,`passports/${uuidv4()}-${passport.name}`)
    await uploadBytes(imageRef,passport)
    .then(async(snapshot)=>{
      const url = await getDownloadURL(snapshot.ref)
      //dateOfBirth:dateData
      await addDoc(collection(dbStore, 'people'),{...values,passport:url,createdAt:serverTimestamp()})
      .then(()=>{
        addMessage('successfully submitted')
        console.log('person2',{...values,passport:url,createdAt:serverTimestamp()})
        setTimeout((()=>setIsSubmitted(true)),1000)
      })
      .catch((e)=>{
        addMessage(customFormError.error)
        console.error('form',e)
      })
      
    })
    .catch((e)=>{
      addMessage(customFormError.image)
      console.error('image',e)
    })
    setLoading(false)  
  }
  const FormHeader =()=>{
    return(
      <div className="text-center my-4 form-title" >
        <div className="image-container">
          <img
            alt="ckc"
            src="/logo.png"
            width={250}
            height={250}
          />
        </div>
        <h1 className="h1">Unique Set CKC &apos;86</h1>
        <h3 className="h3 has-text-secondary">Multipurpose Co-Operative Society Limited</h3>
        <OptionalInfo/>
      </div>
    )
  }

  const initialFormValues= {
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    otherPhone:'',
    gender:'',
    dateOfBirth:'',
    homeAddress: '',
    NextOfKin: '',
    NextOfKinPhoneNumber: '',
    NextOfKinEmail: '',
    workAddress: '',
    profession:'',
    monthlyContribution: '',
    passport:null
  }
  const FormBody = ()=>{
    const formikProps = useFormikContext()
    const formNameObj = {
      names:[{
        name:'firstName',
        label:'First Name',
        size:4
      },{
        name:'middleName',
        label:'Middle Name*',
        size:4,
        required:false
      },{ 
        name:'lastName',
        label:'Last Name(Surname)',
        size:4
      }],
      email:[{
        name:'email',
        type:'eamil',
        label:'E-mail Address',
        placeholder:"name@example.com",
        addOn:"@"
      }],
      phone:[{
        name:'phone',
        label:'Phone Number',
      }],
      gender:[{
        name:'otherPhone',
        label:'Other Phone Number*',
        size:6,
        required:false
      },{
        component:SelectBootstrap,
        label:'gender',
        name:'gender',
        options:[
          {name:'male',value:'M'},
          {name:'female',value:'F'}
        ],
        size:3
      },{
        type:"date",
        name:"dateOfBirth",
        //value:dateData,
        //onChange:setDateData,
        label:"Date of Birth",
        size:3
      }],
      homeAddress:[{
        label:"Address",
        name:"homeAddress",
        as:"textarea",
        rows:4,
      }],
      passport:[{
        component:InputPassport,
        label:"Upload Passport",
        name:"passport",
        onChange:(event)=>{
          formikProps.setFieldValue("passport", event.currentTarget.files[0]);
        } 
      }],
      monthlyContribution:[{
        label:"Profession",
        name:"profession",
        size:8,
      },{
        size:4,
        type:"number",
        name:"monthlyContribution",
        label:"Monthly Contribution",
        step:1000,
        addOn:"₦",
      }],
      workAddress:[{
        label:"Work Address" ,
        name:"workAddress",
        as:"textarea",
        rows:4,
      }],
      NextOfKin:[{
        name:'NextOfKin',
        label:'Spouse/Next of Kin(Full Name)',
      }],

      NextOfKinPhoneNumber:[{
        label:"Spouse/Next of Kin Phone Number",
        name:"NextOfKinPhoneNumber",
        size:6,
      },{
        name:'NextOfKinEmail',
        type:'eamil',
        label:'Spouse/Next of Kin E-mail Address*',
        placeholder:"name@example.com",
        addOn:"@",
        size:6,
        required:false
      }],
    }
    return(
      <Form noValidate method="POST" className="mx-2 p-1 form">
        {Object.keys(formNameObj).map(rows=>(
          <Row key={rows} className="mb-3">
            {formNameObj[rows].map((formInput,index)=>{
              const InputType = formInput.component ?? InputBootstrap
              const updatedFormInput = {...formInput}
              delete updatedFormInput.component
              return(
                <InputType
                  key={formInput.name+index}
                  submitCount={formikProps.submitCount}
                  value={formikProps.values[formInput.name]}
                  onChange={formInput.onChange??formikProps.handleChange}
                  error={formikProps.errors[formInput.name]}
                  required={formInput.required ?? true}
                  {...updatedFormInput}
                />
              )
            })}
          </Row>
        ))}
        {/* <input type="date" name="date-test" value={dateData} onChange={changeDate}/> */}
        <OptionalInfo/>
        <Button type="submit" size='lg' disabled={isLoading} onClick={formikProps.handleSubmit}>{isLoading?'Loading...':'Submit'}</Button>
        <>{(formikProps.submitCount > 0 && !formikProps.isValid) && <span style={{textAlign:"center",display:"block",}} className="text-danger my-2">please check for any errors before you submit</span>}</>
      </Form>
    )
  }
  const FormikForm = ()=>(
    <Formik
      validationSchema={schema}
      onSubmit={submitForm}
      initialValues={initialFormValues}
    >
      <FormBody/>
    </Formik>
  )
  
  const Submitted = ()=>{
    return(
      <>
        <div>
          <h1 style={{fontWeight:600}}className="display-3 text-success">Thank you for submitting, your form has been sent.</h1>
        </div>
      </>
    )
   
  } 
  
  //remove number
  return (
    <main>
      <Head>
        <title>Unique Set CKC &apos;86</title>
        <meta name="theme-color" content="#0001fc"></meta>
      </Head>
      <section >
        
        <div className="container" ref={animateParent} >
          <FormHeader/>
          {isSubmitted ? <Submitted/>:<FormikForm/>}
          <DisplayToast show={toastData.show} message={toastData.message} close={()=>closeToast(setLoading,false)}/>
        </div>
        <img
          className='bottom-waves'
          src="/waves.svg"
          alt="waves"
        />
      </section>
     
    </main>
  )
}

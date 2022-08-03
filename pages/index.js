import {useState} from 'react'
import Head from 'next/head'
import {Formik} from 'formik'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'

import {InputBootstrap,InputBootstrapAddOn,missingError,lengthError,regEx} from '../components/inputs'
import {storage,dbStore} from '../components/firebase'
import {ref,uploadBytes,getDownloadURL } from 'firebase/storage'
import { collection, addDoc,serverTimestamp  } from 'firebase/firestore' 
import { v4 as uuidv4 } from 'uuid'
import * as Yup from 'yup'
import { Calendar } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css' 
export default function Home() {
  const toastDefault = {show:false,message:''}
  const [dateData,setDateData] = useState(new Date(1970,0))
  const [toastData,setToastData] = useState(toastDefault)
  const [isLoading, setLoading] = useState(false);
  const [isSubmitted,setIsSubmitted] = useState(false)
  const closeToast = ()=>{
    setToastData({...toastData,show:false})
    setLoading(false)
  }
  const addMessage = (msg)=>{
    setToastData({show:true,message:msg})
  }
  const DisplayToast =()=>{
    return(
      <ToastContainer className="position-fixed bottom-0 start-50 translate-middle-x" position="bottom-center">
      <Toast bg="secondary" show={toastData.show} onClose={closeToast} position="bottom-center" delay={5500} autohide>
        <Toast.Header closeVariant="white">
          <strong className="me-auto"></strong>
        </Toast.Header>
        {/* <Toast.Body className="text-center">{toastData.message}</Toast.Body> */}
        <Toast.Body className="text-center">{toastData.message}</Toast.Body>

      </Toast>
      </ToastContainer>
    )
  }
 
  const customFormError = {
    size:'file is too large',
    type:'file is not valid',
    image:'problem uploading image',
    error:'problem submitting form',
    invalidText:'invalid character',
    invalidAddress:'invalid address',
  }

  //neo4j
  //mDZrZLxnBlZKinMlNvrXgql1QKlMCM9QVHmpsxo_QQQ
  const isDividedBy1000 = (num)=>{
    if(num < 1000 || isNaN(1000)) return false
    return(num%1000===0)?true:false
  }
  const submitForm = async (values)=>{
    if(isLoading){
      return
    }
    setLoading(true)
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
      await addDoc(collection(dbStore, 'people'),{...values,dateOfBirth:dateData,passport:url,createdAt:serverTimestamp()})
      .then(()=>{
        addMessage('successfully submitted')
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
    homeAddress: Yup.string()
      .required(missingError('home address'))
      .min(2,'the name is too short')
      .max(130,'please reduce the details')
      .matches(regEx.address,customFormError.invalidAddress)
      .trim(),
    NextOfKin: Yup.string()
      .required(missingError('Next of Kin','a'))
      .min(2,missingError('details','more'))
      .max(50,'please reduce the details')
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
      .max(130,'please reduce the details')
      .matches(regEx.address,customFormError.invalidAddress)
      .trim(),
    profession: Yup.string()
      .required(missingError('current profession'))
      .min(2,missingError('details','more'))
      .max(45,'please reduce the details')
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
      </div>
    )
  }
  const FormikForm = ()=>{
    return(
          <Formik
            validationSchema={schema}
            onSubmit={submitForm}
            initialValues={{
              firstName: '',
              lastName: '',
              middleName: '',
              email: '',
              phone: '',
              otherPhone:'',
              gender:'',
              homeAddress: '',
              NextOfKin: '',
              NextOfKinPhoneNumber: '',
              NextOfKinEmail: '',
              workAddress: '',
              profession:'',
              monthlyContribution: '',
              passport:null
            }}
          >
            {({
              handleSubmit,
              handleChange,
              values,
              isValid,
              errors,
              setFieldValue,
              submitCount
            }) => (
              <Form noValidate method="POST" className="mx-2 p-1 form">
                <FormHeader/>

                {/*names*/}
                <Row className="mb-3">
                  <InputBootstrap 
                    count={submitCount}
                    size={4}
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    required
                    label="First Name"
                  />
                  <InputBootstrap 
                    count={submitCount}
                    size={4}
                    name="middleName"
                    value={values.middleName}
                    onChange={handleChange}
                    error={errors.middleName}
                    label="Middle Name(optional)"
                  />
                  <InputBootstrap 
                    count={submitCount}
                    size={4}
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    required
                    label="Last Name(Surname)"
                  />                 
                </Row>
                {/*email address*/}
                <Row className="mb-3">
                  <InputBootstrapAddOn
                    count={submitCount}
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    aria-describedby="inputGroupPrepend"
                    value={values.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                    addOn="@"
                    label="E-mail Address"
                  />               
                </Row>   
                {/*gender phone*/}
                <Row className="mb-3">
                  <InputBootstrap 
                    count={submitCount}
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    required
                    label="Phone Number"
                  />
                </Row>
                <Row className="mb-3">
                <InputBootstrap 
                  count={submitCount}
                  size={8}
                  name="otherPhone"
                  value={values.otherPhone}
                  onChange={handleChange}
                  error={errors.otherPhone}
                  required
                  label="Other Phone Number(optional)"

                />
                  <Form.Group as={Col} className="mb-1" md="4" controlId="validationFormikGender">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select 
                      aria-label="Default select example"
                      name="gender"
                      value={values.gender}
                      onChange={handleChange}
                      isInvalid={errors.gender && (values.gender || submitCount)}
                      required

                    >
                      <option>select one</option>
                      <option value="M">male</option>
                      <option value="F">female</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.gender}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                {/*DOB*/}
                <Row className="mb-3">
                  <Form.Group as={Col} className="mb-1" md="12" controlId="validationFormikDoB">
                    <Form.Label>Date of Birth </Form.Label>
                    <br/>
                    <div style={{display:'flex',justifyContent:'center'}}>
                      <Calendar name="dateOfBirth" date={dateData} maxDate={new Date()} onChange={setDateData}/>                
                    </div>
                  </Form.Group>
                </Row>
                {/*HOME address*/}
                <Row className="mb-3">
                  <InputBootstrap 
                    count={submitCount}
                    label="Address"
                    placeholder="home address"
                    name="homeAddress"
                    as="textarea"
                    rows={4}
                    value={values.homeAddress}
                    onChange={handleChange}
                    error={errors.homeAddress}
                    required
                  />
                </Row>
                {/*passport*/}
                <Row className="mb-3">
                  <Form.Group className="position-relative mb-3">
                    <Form.Label>Upload Passport</Form.Label>
                    <Form.Control
                      type="file"
                      required
                      name="passport"
                      onChange={(event) => {
                        setFieldValue("passport", event.currentTarget.files[0]);
                      }}                      
                      isInvalid={errors.passport && (submitCount || values.passport)}
                      accept=".png, .jpg, .jpeg"

                    />
                    <Form.Control.Feedback type="invalid" tooltip>
                      {errors.passport}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
               
                {/* profession//expected monthly contribution*/}
                <Row className="mb-3">
                  <InputBootstrap 
                    count={submitCount}
                    size={8}
                    value={values.profession}
                    onChange={handleChange}
                    error={errors.profession}
                    required
                    label="Profession"
                    name="profession"
                  />
                  <InputBootstrapAddOn
                    count={submitCount}
                    size={4}
                    type="number"
                    name="monthlyContribution"
                    label="Monthly Contribution"
                    value={values.monthlyContribution}
                    onChange={handleChange}
                    error={errors.monthlyContribution}
                    required
                    step="1000"
                    addOn="₦"
                  />
                </Row>
                {/* work address*/}
                <Row className="mb-3">
                  <InputBootstrap 
                    count={submitCount}
                    label="Work Address" 
                    name="workAddress"
                    as="textarea"
                    rows={4}
                    value={values.workAddress}
                    onChange={handleChange}
                    error={errors.workAddress}
                    required
                  />
                </Row>
                 {/*NextOfKin*/}
                 <Row className="mb-3">
                  <InputBootstrap 
                    count={submitCount}
                    label="Spouse/Next of Kin(Full Name)"
                    value={values.NextOfKin}
                    onChange={handleChange}
                    error={errors.NextOfKin}
                    name="NextOfKin"
                    required
                  />
                </Row>
                 {/*NextOfKin*/}
                 <Row className="mb-3">
                  <InputBootstrap 
                    count={submitCount}
                    label="Spouse/Next of Kin Phone Number"
                    value={values.NextOfKinPhoneNumber}
                    onChange={handleChange}
                    error={errors.NextOfKinPhoneNumber} 
                    name="NextOfKinPhoneNumber"
                    required
                    size={6}
                  />
                  <InputBootstrapAddOn
                    count={submitCount}
                    type="email"
                    size={6}
                    name="NextOfKinEmail"
                    placeholder="name@example.com"
                    aria-describedby="inputGroupPrepend"
                    value={values.NextOfKinEmail}
                    onChange={handleChange}
                    error={errors.NextOfKinEmail}
                    addOn="@"
                    label="Spouse/Next of Kin E-mail Address(optional)"
                  />
                </Row>
                <Button type="submit" size='lg' disabled={isLoading} onClick={handleSubmit}>{isLoading?'Loading...':'Submit'}</Button>
                <>{(submitCount > 0 && !isValid) && <span style={{textAlign:"center",display:"block",}} className="text-danger my-2">please check for any errors before you submit</span>}</>
              </Form>
            )}
          </Formik>
    )
  }
  const Submitted = ()=>{
    return(
      <>
        <FormHeader/>
        <div>
          <h1 style={{fontWeight:600}}className="display-3 text-success">Thank for submitting your form has been sent</h1>
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
      <section>
        <div className="container">
          {isSubmitted ? <Submitted/>:<FormikForm/>}
          <DisplayToast/>
        </div>
        <img
          className='bottom-waves'
          src="/waves.svg"
        />
      </section>
     
    </main>
  )
}

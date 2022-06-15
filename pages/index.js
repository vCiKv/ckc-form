import {useState,useRef} from 'react'
import {Formik} from 'formik'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'


import {storage,dbStore} from '../components/firebase'
import {ref,uploadBytes,getDownloadURL } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore' 
import { v4 as uuidv4 } from 'uuid'

import * as Yup from 'yup'
import dayjs from 'dayjs'

import { Calendar } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css' 
export default function Home() {
  const toastDefault = {show:false,message:''}
  const [dateData,setDateData] = useState(new Date())
  const [toastData,setToastData] = useState(toastDefault)
  const [isLoading, setLoading] = useState(false);
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
      <Toast bg="secondary" show={toastData.show} onClose={closeToast} position="bottom-center" delay={4500} autohide>
        <Toast.Header>
          <strong className="me-auto"></strong>
        </Toast.Header>
        <Toast.Body className="text-center">{toastData.message}</Toast.Body>
      </Toast>
      </ToastContainer>
    )
  }
  const errors = {
    size:'file is too large',
    type:'file is not valid',
    image:'problem uploading image',
    error:'problem submitting form'
  }
  //neo4j
  //mDZrZLxnBlZKinMlNvrXgql1QKlMCM9QVHmpsxo_QQQ
  // const validateValues = (values)=>{
  //   const {passport} = values
  //   if(!passport){
  //     addMessage(errors.type)
  //     return
  //   }
  //   if(!passport.type.includes('image/')){
  //     addMessage(errors.type)
  //     return
  //   }
  //   if(passport.size > (3 * 1048576)){
  //     addMessage(errors.size)
  //     return
  //   }
  // }
  const submitForm= async (values)=>{
    if(isLoading){
      return
    }
    setLoading(true)
    const {passport} = values
    if(!passport){
      addMessage(errors.type)

      return
    }
    if(!passport.type.includes('image/')){
      addMessage(errors.type)
      return
    }
    if(passport.size > (3 * 1048576)){
      addMessage(errors.size)
      return
    }
    //confirm date
    const imageRef = ref(storage,`passports/${uuidv4()}-${passport.name}`)
    await uploadBytes(imageRef,passport)
    .then((snapshot)=>{
      getDownloadURL(snapshot.ref)
      .then(async(url)=>{
        await addDoc(collection(dbStore, 'people'),{...values,dateOfBirth:dateData,passport:url})
        .then(()=>{
          addMessage('successfully submitted')
        })
        .catch((e)=>{
          addMessage(errors.error)
          console.error('form',e)
        })
      })
    })
    .catch((e)=>{
      addMessage(errors.image)
      console.error('image',e)
  
    })
    setLoading(false)
  }
  const schema = Yup.object().shape({
    firstName: Yup.string().required('please fill your first name').min(2,'your name is too short').max(30,'your name is too long').matches(/^[A-Za-z()-]+$/,'invalid character').trim().lowercase(),
    lastName: Yup.string().required('please fill your last name').min(2,'your name is too short').max(30,'your name is too long').matches(/^[A-Za-z()-]+$/,'invalid character').trim().lowercase(),
    middleName: Yup.string().min(2,'your name is too short').max(30,'your name is too long').matches(/^[A-Za-z()-]+$/,'invalid character').trim().lowercase(),
    email: Yup.string().required('please fill your E-mail').email('please use a valid E-mail').trim().lowercase(),
    phone: Yup.string().required('please fill your phone number').min(6,'invalid phone number').matches(/^[\d()+-]+$/,'invalid phone number').trim(),
    gender: Yup.string().required('please input your gender').oneOf(['M','F'], 'invalid input'),
    homeAddress: Yup.string().required('please fill your home address').min(2,'the name is too short').max(130,'please shorten the information').matches(/^[A-Za-z\d()-,.]+$/,'invalid address').trim(),
    NextOfKin: Yup.string().required('please fill a Next of Kin').min(2,'please fill more details').max(50,'please reduce the details').matches(/^[A-Za-z()-]+$/,'invalid character').trim().lowercase(),
    workAddress: Yup.string().required('please fill your work address').min(2,'please fill more details').max(130,'please shorten the information').matches(/^[A-Za-z\d()-,.]+$/,'invalid address').trim(),
    profession: Yup.string().required('please fill your current profession').min(2,'please fill more details').max(45,'please reduce the details').matches(/^[A-Za-z\d]+$/,'invalid character').trim().lowercase(),
    monthlyContribution: Yup.number().required('please fill an amount').positive('invalid number').integer('invalid number').moreThan(500,'amount is too low'),
    passport: Yup.mixed().required('upload a passport photograph')
  })

  //remove number
  return (
    <main>
      <section>
        <div className="container">
          <Formik
            validationSchema={schema}
            onSubmit={submitForm}
            initialValues={{
              firstName: '',
              lastName: '',
              middleName: '',
              email: '',
              phone: '',
              gender:'',
              homeAddress: '',
              NextOfKin: '',
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
              touched,
              errors,
              setFieldValue
            }) => (
              <Form noValidate className="mx-2 p-1">
                <h1 className="display-2 text-center my-4">CKC Form</h1>
                {/*names*/}
                <Row className="mb-3">
                  <Form.Group as={Col} className="mb-1" md="4" controlId="validationFormikFirstName">
                    <Form.Label>First name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={values.firstName}
                      onChange={handleChange}
                      isValid={touched.firstName && !errors.firstName}
                      isInvalid={!!errors.firstName}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.firstName}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} className="mb-1" md="4" controlId="validationFormikMiddleName">
                    <Form.Label>Middle Name(optional)</Form.Label>
                    <Form.Control
                      type="text"
                      name="middleName"
                      value={values.middleName}
                      onChange={handleChange}
                      isInvalid={!!errors.middleName}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.middleName }
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} className="mb-1" md="4" controlId="validationFormikLastName">
                    <Form.Label>Last Name(Surname)</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={values.lastName}
                      onChange={handleChange}
                      isValid={touched.lastName && !errors.lastName}
                      isInvalid={!!errors.lastName}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lastName}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                </Row>
                {/*email address*/}
                <Row className="mb-3">
                  <Form.Group as={Col} className="mb-1" md="12" controlId="validationFormikEmail">
                    <Form.Label>E-mail Address</Form.Label>
                    <InputGroup hasValidation>
                      <InputGroup.Text id="basic-addon1">@</InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        aria-describedby="inputGroupPrepend"
                        value={values.email}
                        onChange={handleChange}
                        isValid={touched.email && !errors.email}
                        isInvalid={errors.email}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </InputGroup>     
                  
                  </Form.Group>
                
                </Row>   
                {/*gender phone*/}
                <Row className="mb-3">
                  <Form.Group as={Col} className="mb-1" md="9" controlId="validationFormikPhone">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      className="remove-input-arrow"
                      value={values.phone}
                      onChange={handleChange}
                      isValid={touched.phone && !errors.phone}
                      isInvalid={errors.phone}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} className="mb-1" md="3" controlId="validationFormikGender">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select 
                      aria-label="Default select example"
                      name="gender"
                      value={values.gender}
                      onChange={handleChange}
                      isInvalid={!!errors.gender}
                      isValid={touched.gender && !errors.gender}
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
                  <Form.Group as={Col} className="mb-1" md="12"  controlId="validationFormikHomeAddress">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      placeholder="home address"
                      name="homeAddress"
                      as="textarea"
                      rows={4}
                      value={values.homeAddress}
                      onChange={handleChange}
                      isInvalid={!!errors.homeAddress}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.homeAddress}
                    </Form.Control.Feedback>
                  </Form.Group>
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
                      isInvalid={!!errors.passport}
                      accept=".png, .jpg, .jpeg"
                    />
                    <Form.Control.Feedback type="invalid" tooltip>
                      {errors.passport}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                {/*NextOfKin*/}
                <Row className="mb-3">
                  <Form.Group as={Col} className="mb-1" md="12" controlId="validationFormikNextOfKin">
                    <Form.Label>Spouse/Next of Kin</Form.Label>
                    <Form.Control
                      type="text"
                      name="NextOfKin"
                      value={values.NextOfKin}
                      onChange={handleChange}
                      isInvalid={!!errors.NextOfKin}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.NextOfKin}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                {/* profession//expected monthly contribution*/}
                <Row className="mb-3">
                  <Form.Group as={Col} className="mb-1" md="8" controlId="validationFormikProfession">
                    <Form.Label>Profession</Form.Label>
                    <Form.Control
                      type="text"
                      name="profession"
                      value={values.profession}
                      onChange={handleChange}
                      isInvalid={!!errors.profession}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.profession}
                    </Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group as={Col} className="mb-1" md="4" controlId="validationFormikMonthlyContribution">
                    <Form.Label>Monthly Contribution</Form.Label>
                      <InputGroup hasValidation>
                        <InputGroup.Text id="basic-addon1">₦</InputGroup.Text>
                        <Form.Control
                          type="number"
                          name="monthlyContribution"
                          value={values.monthlyContribution}
                          onChange={handleChange}
                          isValid={touched.monthlyContribution && !errors.monthlyContribution}
                          isInvalid={errors.monthlyContribution}
                          required
                          step="50"
                        /> 
                        <Form.Control.Feedback type="invalid">
                          {errors.monthlyContribution}
                        </Form.Control.Feedback>
                        </InputGroup>
                  </Form.Group>
                </Row>
                {/* work address*/}
                <Row className="mb-3">
                  <Form.Group as={Col} className="mb-1" md="12"  controlId="validationFormikWorkAddress">
                    <Form.Label>Work Address</Form.Label>
                    <Form.Control
                      placeholder="office address"
                      name="workAddress"
                      as="textarea"
                      rows={4}
                      value={values.workAddress}
                      onChange={handleChange}
                      isInvalid={!!errors.workAddress}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.workAddress}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Row>
                {/* <Button type="submit" size='lg' disabled={isLoading} onClick={()=>submitForm(values)}>{isLoading?'Loading...':'Submit form'}</Button> */}
                <Button type="submit" size='lg' disabled={isLoading} onClick={handleSubmit}>{isLoading?'Loading...':'Submit form'}</Button>
              
              </Form>
            )}
          </Formik>
          <DisplayToast/>
        </div>
      </section>
     
    </main>
  )
}

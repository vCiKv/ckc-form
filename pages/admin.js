import {useState,useEffect} from 'react'
import {useRouter} from 'next/router' 
import Head from 'next/head'
import * as Yup from 'yup'
import dayjs from 'dayjs'
import {InputBootstrap,missingError} from '../components/inputs'
import {Formik} from 'formik'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'

import { fireAuth,dbStore } from '../components/firebase'
import { signOut,signInWithEmailAndPassword,onAuthStateChanged  } from "firebase/auth"
import { collection, getDocs } from "firebase/firestore";

const Dashboard = ({user})=>{
    const [peopleList,setPeopleList] = useState([])
    const router = useRouter()
    const getOut = () => router.push('/')
    const logOut = async()=>{
        if(confirm('are you sure you want to logout?')){
            await signOut(fireAuth).then(()=>getOut()).catch(()=>console.error('problem Signing out'))
        }else{
            return
        }
    }
    const sortName=()=>{
        const copyArr = [...peopleList]
        const compare = (a,b)=>{
            return ((a < b) ? -1 : ((a > b )? 1 : 0))
        }
        copyArr.sort((a,b)=>compare(a.firstName.toLowerCase(),b.firstName.toLowerCase()))
        setPeopleList(copyArr)

    }
    useEffect(()=>{
        if(!user) getOut() 
        const getPeopleList = async()=>{
            const peopleListRef = collection(dbStore,'people')
            const snapshot = await getDocs(peopleListRef)
            const peopleArray=[]
            snapshot.forEach((snap)=>{
                peopleArray.push({id:snap.id,...snap.data()})
            })
            setPeopleList(peopleArray)
        }
        getPeopleList()
    },[user])
    const PeopleTable = ()=>{
        return(
            <div>
            <Table striped bordered hover responsive>
                <thead className="thead-light">
                    <tr>
                        <th>name</th>
                        <th>email</th>
                        <th>phone number</th>
                        <th>address</th>
                        <th>profession</th>
                        <th>monthly contribution</th>
                        <th>gender</th>
                        <th>birthday</th>
                        <th>passport</th>
                        <th>next of kin</th>
                        <th>next of contact</th>
                    </tr>
                </thead>
                <tbody>
                    {peopleList.map(person=>(
                        <tr key={person.id}>
                            <td>{(`${person.firstName} ${person.middleName??''} ${person.lastName}`).toLowerCase()}</td>
                            <td>{person.email.toLowerCase()}</td>
                            <td>{`${person.phone}, ${person.otherPhone??''}`}</td>
                            <td>{person.homeAddress.toLowerCase()}</td>
                            <td>{person.profession.toLowerCase()}</td>
                            <td>{'₦'+person.monthlyContribution.toLocaleString('US-en')}</td>
                            <td>{person.gender === 'M'?'male':'female'}</td>
                            <td>{dayjs(person.dateOfBirth.seconds).format('DD/MM/YYYY')}</td>
                            <td><a href={person.passport}>{person.passport}</a></td>
                            <td>{person.NextOfKin.toLowerCase()}</td>
                            <td>{`${person.NextOfKinPhoneNumber} ${person.NextOfKinEmail??''}`}</td>                        
                        </tr>
                    ))}
                </tbody>
            </Table>
            </div>
        )
    
                        
    }
    return(
        <div className="container">
            <h2 className='heading-1'>Welcome Admin</h2>
            <Button onClick={logOut} className="btn btn-danger ">Logout</Button>
            <Button onClick={sortName} className="btn btn-primary mx-4">sort by name</Button>
            
            <div>
                <h4>Registered</h4>
                {peopleList.length > 1 ? <PeopleTable/> :<div style={{height:"60vh"}}>No Data found</div>}   
                <Button className="btn btn-secondary" onClick={()=>alert('not done yet')}>download data</Button>
            </div>
        </div>
    )
}
const SignIn=({submit,isLoading})=>{

    const formData = [
        {
            name:"email",
            type:"text",
        },
        {
            name:"password",
            type:"password",
        },
    ]
    const schema = Yup.object().shape({
        email: Yup.string()
          .required(missingError('username'))
          .trim()
          .email('a valid email is required')
          .lowercase(),
        password: Yup.string()
          .required(missingError('password'))
    })
    
    return(
        <section>
        <div className="container">
            <Formik
                validationSchema={schema}
                onSubmit={submit}
                initialValues={{
                    email:"",
                    password:""
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
            <Form noValidate className="mx-2 p-1 form">
                <div className="text-center my-4 mb-1 form-title">
                  <h1>Admin</h1>
                  <h3 className="has-text-secondary">input your credentials</h3>
                </div>
                <Row className="mb-3">
                {formData.map(input=>
                    <InputBootstrap 
                        key={input.name} 
                        name={input.name} 
                        label={input.name} 
                        type={input.type} 
                        size={6}  
                        value={values[input.name]}
                        onChange={handleChange}
                        error={errors[input.name]}
                        required
                    />
                )}
                </Row>
                <Button type="submit" size='lg' disabled={isLoading} onClick={handleSubmit}>{isLoading?'Loading...':'Submit'}</Button>
            </Form>
            )}
            </Formik>
            </div>
        
        </section>
        
    )

}
export default function Admin(){
    const [isLoading, setLoading] = useState(false);
    const [user,setUser]= useState(null) 
    const submitForm = async(values)=>{
        setLoading(true)
        await signInWithEmailAndPassword(fireAuth,values.email,values.password)
        .then((userCredentials)=>{
            setUser(userCredentials.user)
        })
        .catch((e)=>{
            console.error('unable to get admin')
        })
        .then(()=>setLoading(false))
    }
    useEffect(()=>{
        const getUser = async()=>{
            onAuthStateChanged (fireAuth,(admin)=>{
                if(admin){
                    setUser(admin)
                }
            })
        }
        getUser()
    },[])
    return(
        <main>
            <Head>
            <title>Unique Set CKC &apos;86</title>
            <meta name="theme-color" content="#0001fc"></meta>
            </Head>
            <section>{( !user )? <SignIn isLoading={isLoading} submit={submitForm}/> : <Dashboard user={user}/>}<img className="bottom-waves" src="/waves.svg"/></section>
        </main>
    )
}
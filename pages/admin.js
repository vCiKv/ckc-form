import {useState,useEffect} from 'react'
import Image from 'next/image'
import {useRouter} from 'next/router' 
import Head from 'next/head'
import dayjs from 'dayjs'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import {InputBootstrap} from '../components/inputs'
import {Formik} from 'formik'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import { Container } from 'react-bootstrap'
import { fireAuth,dbStore } from '../components/firebase'
import { signOut,signInWithEmailAndPassword,onAuthStateChanged  } from "firebase/auth"
import { collection, getDocs} from "firebase/firestore";
import { adminSchema } from '../lib/formSchema'

const Dashboard = ({user})=>{
    // console.log('rendered dash')
    const [peopleList,setPeopleList] = useState([])
    const [seeImage,setSeeImage] = useState(false)
    const [isTable,setIsTable] = useState(false)
    const [animateParent] = useAutoAnimate()
    
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
    const sortAmount=()=>{
        const copyArr = [...peopleList]
        const compare = (a,b)=>{
            return ((a < b) ? 1 : ((a > b )? -1 : 0))
        }
        copyArr.sort((a,b)=>compare(a.monthlyContribution,b.monthlyContribution))
        setPeopleList(copyArr)

    }
    const sortCreation=(type=1)=>{
        const copyArr = [...peopleList]
        const compare = (a,b)=>{
            if(type === 1){
                return ((dayjs(a).isBefore(b)) ? -1 : ((dayjs(a).isAfter(b) )? 1 : 0))
            }else{
                return ((dayjs(a).isBefore(b)) ? 1 : ((dayjs(a).isAfter(b) )? -1 : 0))
            }
        }
        copyArr.sort((a,b)=>compare(a.createdAt.toDate(),b.createdAt.toDate()))
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
    },[])
    const PassportImage = ({alt,src,noLink})=>{
        return(
            <>
            {!noLink && <a className="link" href={src}>open</a>}
            <div style={{position:"relative",width:170,height:170,margin:"0 auto"}}>
                <Image
                    src={src}
                    alt={alt}
                    layout="fill"
                    width={"100%"}
                    height={150}
                />
            </div>
            </>
        )
    }
    const PeopleTable = ()=>{      
        return(
            <div className="table-responsive">
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
                        <th>created</th>
                    </tr>
                </thead>
                <tbody>
                    {peopleList.map(person=>{
                       const useDateOfBirth = typeof(person.dateOfBirth) === "object" ? person.dateOfBirth.toDate() : person.dateOfBirth                          
                        return(
                        <tr key={person.id}>
                            <td>{(`${person.firstName} ${person.middleName??''} ${person.lastName}`).toLowerCase()}</td>
                            <td>{person.email.toLowerCase()}</td>
                            <td>{`${person.phone}, ${person.otherPhone??''}`}</td>
                            <td>{person.homeAddress.toLowerCase()}</td>
                            <td>{person.profession.toLowerCase()}</td>
                            <td>{'₦'+person.monthlyContribution.toLocaleString('US-en')}</td>
                            <td>{person.gender === 'M'?'male':'female'}</td>
                            <td>{dayjs(useDateOfBirth).format('DD/MM/YYYY')}</td>
                            <td>{seeImage?<PassportImage src={person.passport} alt={person.lastName}/>:<a href={person.passport}>{(`passport-${person.lastName}`).toLowerCase()}</a>}</td>
                            <td>{person.NextOfKin.toLowerCase()}</td>
                            <td>{`${person.NextOfKinPhoneNumber} ${person.NextOfKinEmail??''}`}</td> 
                            <td>{dayjs(person.createdAt.toDate()).format('DD/MM/YYYY HH:mm:ss')}</td>
                        </tr>
                        )
                    })}
                </tbody>
            </Table>
            </div>
        )
    
                        
    }
    const PeopleCard = ()=>{
        return(
            <Row xs={1} md={3} className="g-4" style={{alignItem:"stretch"}}>
                {peopleList.map(person=>{
                    const useDateOfBirth = typeof(person.dateOfBirth) === "object" ? person.dateOfBirth.toDate() : person.dateOfBirth                           
                    return(
                        <Col style={{height:"100%"}} key={person.id}>
                        <Card className="rounded-lg">
                            {/* <Card.Img variant="top" src={person.passport} /> */}
                            <PassportImage src={person.passport} alt="img" noLink/>
                            <Card.Body>
                                <Card.Title style={{height:75}}>{(`${person.firstName} ${person.middleName??''} ${person.lastName}`).toLowerCase()}</Card.Title>
                                <Card.Text>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item style={{fontSize:18,height:75}}>{person.email.toLowerCase()}</ListGroup.Item>
                                        <ListGroup.Item style={{fontSize:18,height:75}}>{`${person.phone} ${person.otherPhone??''}`}</ListGroup.Item>
                                        <ListGroup.Item style={{fontSize:18,height:175}}>{person.homeAddress.toLowerCase()}</ListGroup.Item>
                                        <ListGroup.Item style={{fontSize:18,height:75}}>{person.profession.toLowerCase()}</ListGroup.Item>
                                        <ListGroup.Item style={{fontSize:18,height:45}}>{'₦'+person.monthlyContribution.toLocaleString('US-en')}</ListGroup.Item>
                                        <ListGroup.Item style={{fontSize:18,height:45}}>{person.gender === 'M'?'male':'female'}</ListGroup.Item>
                                        <ListGroup.Item style={{fontSize:18,height:45}}>{dayjs(useDateOfBirth).format('DD/MM/YYYY')}</ListGroup.Item>
                                        <ListGroup variant="flush">
                                            <h6 className="h6 my-2">Next of Kin</h6>
                                            <ListGroup.Item style={{fontSize:18,height:100}}>{person.NextOfKin.toLowerCase()}</ListGroup.Item>
                                            <ListGroup.Item style={{fontSize:18,height:140}}>{`${person.NextOfKinPhoneNumber} ${person.NextOfKinEmail??''}`}</ListGroup.Item> 
                                        </ListGroup>
                                    </ListGroup>
                                </Card.Text>
                            </Card.Body>
                            <Card.Footer className="text-muted">created {dayjs(person.createdAt.toDate()).format('DD/MM/YYYY HH:mm:ss')}</Card.Footer>
                        </Card>
                        </Col>
                    )
                })}
            </Row>
        )
    }
    return(
        <Container fluid>
            <h2 className='h2 my-4'>Welcome Admin</h2>
            <Button onClick={logOut} className="btn btn-danger ">Logout</Button><br/>
            <div className="data-style">
                <div style={{}}className="bg-primary text-white">sort by</div>
                <div onClick={sortName} className=" text-primary">name</div>
                <div onClick={sortCreation} className=" text-primary">created</div>
                <div onClick={sortAmount} className=" text-primary">contribution</div>
            </div>
            <br/>
            <div>
                {/* <Button onClick={()=>setSeeImage(!seeImage)} className="btn btn-primary">{seeImage?'display link':'display image'}</Button> */}
                <div style={{width:100}}className="data-style">
                    <div className={!isTable?'active':''} onClick={()=>setIsTable(false)}>
                        Card
                    </div>
                    <div className={isTable?'active':''} onClick={()=>setIsTable(true)}>
                        Table
                    </div>
                </div>
            </div>
            
            <div ref={animateParent}>
                <h4 className="h4">Registered</h4>
                {peopleList.length > 1 ? (isTable ? <PeopleTable/>:<PeopleCard/>) : <div style={{height:"60vh"}}>No data found check internet connection or refresh page</div>}   
                <Button className="btn btn-secondary" onClick={()=>alert('not done yet')}>download data</Button>
            </div>
        </Container>
    )
}
const SignIn=({submit,isLoading})=>{
    // console.log('rendered sign')
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
    // const schema = Yup.object().shape({
    //     email: Yup.string()
    //       .required(missingError('username'))
    //       .trim()
    //       .email('a valid email is required')
    //       .lowercase(),
    //     password: Yup.string()
    //       .required(missingError('password'))
    // })
    
    return(        
        <div className="container" style={{minHeight:"85vh"}}>
            <Formik
                validationSchema={adminSchema}
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
              errors,
              submitCount,
              isValid
            }) => (
            <Form noValidate method="POST" className="mx-2 p-1 form">
                <div className="text-center my-4 mb-1 form-title">
                  <h1 className="h1">Admin</h1>
                  <h3 className=" h3 has-text-secondary">input your credentials</h3>
                </div>
                <Row className="mb-3" style={{maxWidth:"500px",marginLeft:"auto",marginRight:"auto"}}>
                    {formData.map(input=>
                        <InputBootstrap 
                            key={input.name} 
                            name={input.name} 
                            label={input.name} 
                            type={input.type} 
                            size={12}  
                            value={values[input.name]}
                            onChange={handleChange}
                            error={errors[input.name]}
                            submitCount={submitCount}
                            required
                        />
                    )}
                </Row>
                <Button type="submit" size='lg' disabled={isLoading} onClick={handleSubmit}>{isLoading?'Loading...':'Submit'}</Button>
                <>{(submitCount > 0 && !isValid) && <span style={{textAlign:"center",display:"block",}} className="text-danger my-2">please check for any errors before you submit</span>}</>
                    
            </Form>
            )}
            </Formik>
        </div>    
        
    )

}
export default function Admin(){
    // console.log('rendered admin')

    const [isLoading, setLoading] = useState(false);
    const [user,setUser]= useState(null) 
    const [animateParent] = useAutoAnimate()

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
            <section ref={animateParent}>{( !user ) ? <SignIn isLoading={isLoading} submit={submitForm}/> : <Dashboard user={user}/>}<img className="bottom-waves" src="/waves.svg"/></section>
        </main>
    )
}
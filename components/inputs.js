import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import { Calendar } from 'react-date-range'
//import Calendar from 'react-calendar';
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css' 
import 'react-calendar/dist/Calendar.css';

const labelClass=(err,count)=>(
  {
    textTransform:"capitilize",
    color:err&&count>0?'#dc3545':'#0001fc'
  }
)
export const InputBootstrap = ({name,label,addOn=false,submitCount=1,type="text",required=false,onChange,value,error,size=12,...props})=>{
    return(
      <Form.Group as={Col} className="mb-1" md={size} controlId={`validationFormiK${name}`}>
        <Form.Label style={labelClass(error,submitCount)}>{label}</Form.Label>
        <InputGroup hasValidation>
          {addOn && <InputGroup.Text id={"input-basic-addon-"+name}>{addOn}</InputGroup.Text>}
          <Form.Control
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            isInvalid={error &&  (value || submitCount)}
            required={required}
            aria-label={'input-'+name}
            {...props}
          />
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
        </InputGroup>

      </Form.Group>
    )
}
export const SelectBootstrap = ({name,label,options,submitCount=1,type="text",required=false,onChange,value,error,size=4,...props})=>{
  return(
    <Form.Group as={Col} className="mb-1" md={size} controlId={`validationFormiK${name}`}>
      <Form.Label style={labelClass(error,submitCount)}>{label}</Form.Label>
      <InputGroup hasValidation>      
        <Form.Select 
          aria-label={"input-select-"+name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          isInvalid={error && (value || submitCount)}
          {...props}
        >
          <option value="">select one</option>
          {options.map(((option,index) => (
            <option key={option.name+'-'+index+'-'+option.value}value={option.value}>{option.name}</option>
          )))}
        </Form.Select>
      </InputGroup>
      
      <Form.Control.Feedback type="invalid">
        {error}
      </Form.Control.Feedback>
    </Form.Group>
  )
}
export const InputPassport = ({name,label,value,error,submitCount=1,required=false,onChange,...props})=>{
  return(
    <Form.Group className="position-relative mb-3">
      <Form.Label style={labelClass(error,submitCount)}>{label}</Form.Label>
      <Form.Control
        type="file"
        required={required}
        name={name}
        onChange={onChange}                      
        isInvalid={error && (submitCount || value)}
        accept=".png, .jpg, .jpeg"
        aria-label={'input-'+name}
        {...props}

      />
      <Form.Control.Feedback type="invalid" tooltip>
        {error}
      </Form.Control.Feedback>
    </Form.Group>
  )
}
export const SelectCalander =({name,value,label,size,error,submitCount,onChange,required=true})=>{
  return(
    <Form.Group as={Col} className="mb-1" md={size} controlId={"validationFormik"+name}>
      <Form.Label style={labelClass(error,submitCount)}>{label}</Form.Label>
          <Form.Control
            type="date"
            name={name}
            value={value}
            onChange={onChange}
            isInvalid={error && (value || submitCount)}
            required={required}
            aria-label={'input-'+name}
            {...props}
          />
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>

      {/*<br/> 
      <div style={{display:'flex',justifyContent:'center'}}>
        <Calendar 
          name={name} 
          date={value} 
          activeStartDate={new Date(1970,0)} 
          onChange={onChange}
        />                
      </div> */}
    </Form.Group>
  )
}
  //test input group

import InputGroup from 'react-bootstrap/InputGroup'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'

export const InputBootstrap = ({name,label,count=1,type="text",required=false,onChange,value,error,size=12,...props})=>{
    return(
      <Form.Group as={Col} className="mb-1" md={size} controlId={`validationFormiK${name}`}>
        <Form.Label>{label}</Form.Label>
        <Form.Control
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          isInvalid={error &&  (value || count)}
          required={required}
          {...props}
        />
        <Form.Control.Feedback type="invalid">
          {error}
        </Form.Control.Feedback>
      </Form.Group>
    )
  }
export const InputBootstrapAddOn = ({name,label,count=1,type="text",required=false,onChange,value,error,size=12,addOn,...props})=>{
    return(
      <Form.Group as={Col} className="mb-1" md={size} controlId={`validationFormiK${name}`}>
        <Form.Label>{label}</Form.Label>
          <InputGroup hasValidation>
            <InputGroup.Text id={"basic-addon-"+name}>{addOn}</InputGroup.Text>
            <Form.Control
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              isInvalid={error && (value || count)}
              required={required}
              {...props}
            /> 
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          </InputGroup>
      </Form.Group>
    )
  }

export const missingError=(field,prefix = "your")=>{
    return `please fill ${prefix} ${field}`
  }
export const lengthError=(field,isShort = true)=>{
    return `your ${field} is too ${isShort?'short':'long'}`
  }
export const regEx = {
    names:/^[A-Za-z()-]+$/,
    fullName:/^[A-Za-z()-\s]+$/,
    digits:/^[\d()+-]+$/,
    address:/^[A-Za-z\s\d()-,.]+$/,
    profession:/^[A-Za-z\d]+$/,
  } 
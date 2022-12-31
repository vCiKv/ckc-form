import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'

const DisplayToast =({show,close,message})=>(
  <ToastContainer className="position-fixed bottom-0 start-50 translate-middle-x" position="bottom-center">
    <Toast bg="secondary" show={show} onClose={close} position="bottom-center" delay={5500} autohide>
      <Toast.Header closeVariant="white">
        <strong className="me-auto"></strong>
      </Toast.Header>
      <Toast.Body className="text-center">{message}</Toast.Body>
    </Toast>
  </ToastContainer>
)
export default DisplayToast
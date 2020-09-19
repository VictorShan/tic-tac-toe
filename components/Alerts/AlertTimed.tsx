import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";


export type AlertPropsType = {
  variant: string,
  heading?: string,
  message: string,
  duration?: number,
  onClose?: () => void
}


export default function AlertTimed({ variant, heading, message, duration, onClose }: AlertPropsType) {
  const [show, setShow] = useState(true)
  const handleClose = () => { onClose && onClose(); setShow(false) }
  
  useEffect(() => {
    let timeout
    if (duration) {
      timeout = setTimeout(()=> {
        setShow(false)
      }, duration)
    }
    
    return () => {
      clearTimeout(timeout)
    };
  }, []);
  
  return (
    <Alert show={show} variant={variant} onClose={() => handleClose} dismissible>
      {heading && <Alert.Heading>{heading}</Alert.Heading>}
      <p>{message}</p>
    </Alert>
  )
}
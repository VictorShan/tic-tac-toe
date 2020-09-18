import { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";


export type AlertPropsType = {
  variant: string,
  heading?: string,
  message: string,
  duration?: number
}


export default function AlertTimed({ variant, heading, message, duration }: AlertPropsType) {
  const [show, setShow] = useState(true)
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
    <Alert show={show} variant={variant} onClose={() => setShow(false)} dismissible>
      {heading && <Alert.Heading>{heading}</Alert.Heading>}
      <p>{message}</p>
    </Alert>
  )
}
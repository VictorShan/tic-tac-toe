import Modial from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

type propsType = {
  title?: string,
  show: boolean,
  message: string,
  primaryOptionText: string,
  primaryOptionCallback: () => void,
  secondaryOptionText?: string,
  secondaryOptionCallback?: () => void,
  onClose?: () => {}
  size?: "sm" | "lg" | "xl",
  onHide?: () => void
}

export default function ModalWarning(
  {
    title,
    show,
    message,
    primaryOptionText,
    primaryOptionCallback,
    secondaryOptionText,
    secondaryOptionCallback,
    size,
    onHide
  }: propsType) {

    title = title || "Warning!"
    size = size || 'sm'
    const renderSecondary = secondaryOptionText && secondaryOptionCallback
  return (
    <Modial size={size} show={show} centered onHide={onHide} backdrop={'static'}>
      <Modial.Header>
        <Modial.Title>{title}</Modial.Title>
      </Modial.Header>
      <Modial.Body>
        {message}
      </Modial.Body>
      <Modial.Footer>
        {renderSecondary &&
          <Button
            variant={"outline-secondary"}
            onClick={() => { onHide(); secondaryOptionCallback()} }>
              {secondaryOptionText}
          </Button>}
          <Button
            variant={"outline-secondary"}
            onClick={() => { onHide(); primaryOptionCallback()}}>
              {primaryOptionText}
          </Button>
      </Modial.Footer>
    </Modial>
  )
}
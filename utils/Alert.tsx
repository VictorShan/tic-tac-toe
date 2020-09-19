import { createContext, useContext, useState } from "react"
import AlertTimed, { AlertPropsType } from "../components/Alerts/AlertTimed"
import styles from '../styles/AlertContainer.module.sass'


export type AlertType = {
  addAlert: (message: string, variant?: string, heading?: string, duration?: number) => void,
  alerts: { [key: number]: AlertPropsType }
}

const alertContext = createContext<AlertType["addAlert"]>(null)

export const useAlert = () => {
  return useContext(alertContext)
}


function useProvideAlert(): AlertType {
  const [alertNumber, setAlertNumber] = useState(0)
  const [alertKV, setAlertKV] = useState<{ [key: number]: AlertPropsType }>({})


  const addAlert = (message: string, variant?: string, heading?: string, duration?: number) => {
    const newAlert: AlertPropsType = { message, variant, heading,
                                        duration, onClose: () => { removeAlert(alertNumber) }}
    setAlertKV(oldAlertKV => ({...oldAlertKV, [alertNumber]: newAlert}))
    setAlertNumber(oldValue => oldValue + 1)
  }

  const removeAlert = (key: number) => {
    setAlertKV(old => ({
      ...old,
      [key]: undefined
    }))
  }

  return {
    addAlert,
    alerts: alertKV
  }
}

export function ProvideAlert({ children }) {
  const { addAlert, alerts } = useProvideAlert()
  return (
    <alertContext.Provider value={addAlert}>
      {children}
      {translateAlertData(alerts)}
    </alertContext.Provider>
  )
}

function translateAlertData(data: AlertType['alerts']) {
  const alertComponents = []
  for (const key in data) {
    alertComponents.push(
      <AlertTimed key={key} {...data[key]} />
    )
  }
  return (
    <div className={styles.container}>
      {alertComponents.reverse()}
    </div>
  )
}
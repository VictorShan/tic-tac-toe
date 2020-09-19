import { createContext, useContext, useState } from "react"
import AlertTimed, { AlertPropsType } from "../components/Alerts/AlertTimed"
import styles from '../styles/AlertContainer.module.sass'


export type AlertType = {
  addAlert: (data: AlertPropsType) => void,
  alerts: { [key: number]: AlertPropsType }
}

const alertContext = createContext<AlertType["addAlert"]>(null)

export const useAlert = () => {
  return useContext(alertContext)
}


function useProvideAlert(): AlertType {
  const [alertNumber, setAlertNumber] = useState(0)
  const [alertKV, setAlertKV] = useState<{ [key: number]: AlertPropsType }>({})


  const addAlert = (data: AlertPropsType) => {
    data.onClose = () => { removeAlert(alertNumber) }
    setAlertKV(oldAlertKV => ({...oldAlertKV, [alertNumber]: data}))
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
      <div className={styles.wrapper}>
        {children}
        {translateAlertData(alerts)}
      </div>
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
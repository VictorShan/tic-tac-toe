import AlertTimed, { AlertPropsType } from './AlertTimed'
import styles from '../../styles/AlertContainer.module.sass'

type AlertContainerPropsType = {
  alertData: AlertPropsType[]
}

export default function AlertContainer({ alertData }: AlertContainerPropsType) {
  return (
    <div className={styles.container}>
      {alertData.map(alert => {
        return <AlertTimed {...alert} />
      })}
    </div>
  )
}
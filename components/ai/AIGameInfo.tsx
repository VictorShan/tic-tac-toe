import styles from '../../styles/AIGameInfo.module.sass'
export type AIGameInfoProps = {
    className?: string,
    clearBoard: () => void
}
export default function AIGameInfo({ className, clearBoard }: AIGameInfoProps) {
    return (
        <div className={(className && className ) + " " + styles.container}>
            <h2>You vs AI</h2>
            <p>You are X</p>
            <button onClick={clearBoard}>Clear Board</button>
            <footer></footer>
        </div>
    )
}
import styles from '../../styles/AIGameInfo.module.sass'
export type AIGameInfoProps = {
    className?: string,
    clearBoard: () => void,
    gameStatus?: string,
    won?: boolean
}
export default function AIGameInfo({ className, clearBoard, gameStatus, won }: AIGameInfoProps) {
    const color = gameStatus === "Congradulations! You won! You've solved tic-tac-toe." ? "green" : gameStatus === "Sorry, you lost." ? "red" : "black"
    return (
        <div className={(className && className ) + " " + styles.container}>
            <h2>You vs AI</h2>
            <p>You are X</p>
            <h6 style={{ color: color}}>{gameStatus}</h6>
            <button onClick={clearBoard}>Clear Board</button>
        </div>
    )
}
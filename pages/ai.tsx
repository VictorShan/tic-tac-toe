import AIGame from "../components/ai/AIGame"
import Head from 'next/head'

export default function ai() {
    
    return (
        <>
            <Head>
                <title>Tic Tac Toe AI</title>
                <meta name={'description'} content={"A Tic Tac Toe game where the user plays agains an AI"}/>
            </Head>
            <main>
                <AIGame/>
            </main>
            
        </>
    )
}
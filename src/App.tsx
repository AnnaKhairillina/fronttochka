import { useState, useCallback } from 'react';
import Lottie from 'lottie-react';
import gameAnimation from './assets/game.json';
import GameBoard from './components/GameBoard';
import confetti from 'canvas-confetti';

export type Cell = 'X' | 'O' | null;

export default function App() {
    const [cells, setCells] = useState<Cell[]>(Array(9).fill(null));
    const [isGameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<Cell | 'draw'>(null);
    const [winningLine, setWinningLine] = useState<number[]>([]);
    const [isResetting, setIsResetting] = useState(false);
    const [isFading, setIsFading] = useState(false); // NEW

    const checkWinner = useCallback((updatedCells: Cell[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (const [a, b, c] of lines) {
            if (updatedCells[a] && updatedCells[a] === updatedCells[b] && updatedCells[a] === updatedCells[c]) {
                setWinningLine([a, b, c]);
                return updatedCells[a];
            }
        }

        setWinningLine([]);
        return updatedCells.every(cell => cell !== null) ? 'draw' : null;
    }, []);

    const handleCellClick = (index: number) => {
        if (cells[index] || isGameOver) return;

        const nextCells = [...cells];
        nextCells[index] = 'X';

        const result = checkWinner(nextCells);
        if (result) {
            endGame(result, nextCells);
            return;
        }

        setCells(nextCells);
        setTimeout(() => makeComputerMove(nextCells), 500);
    };

    const makeComputerMove = (currentCells: Cell[]) => {
        const emptyIndices = currentCells
            .map((cell, i) => (cell === null ? i : null))
            .filter(i => i !== null) as number[];

        const randomChance = Math.random();

        if (randomChance < 0.5) {
            const i = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            const updated = [...currentCells];
            updated[i] = 'O';
            const result = checkWinner(updated);
            if (result) return endGame(result, updated);
            setCells(updated);
            return;
        }

        for (let i of emptyIndices) {
            const temp = [...currentCells];
            temp[i] = 'O';
            if (checkWinner(temp) === 'O') {
                return endGame('O', temp);
            }
        }

        for (let i of emptyIndices) {
            const temp = [...currentCells];
            temp[i] = 'X';
            if (checkWinner(temp) === 'X') {
                const updated = [...currentCells];
                updated[i] = 'O';
                const result = checkWinner(updated);
                if (result) return endGame(result, updated);
                setCells(updated);
                return;
            }
        }

        if (currentCells[4] === null) {
            const updated = [...currentCells];
            updated[4] = 'O';
            const result = checkWinner(updated);
            if (result) return endGame(result, updated);
            setCells(updated);
            return;
        }

        const corners = [0, 2, 6, 8];
        const freeCorners = corners.filter(i => currentCells[i] === null);
        if (freeCorners.length > 0) {
            const i = freeCorners[Math.floor(Math.random() * freeCorners.length)];
            const updated = [...currentCells];
            updated[i] = 'O';
            const result = checkWinner(updated);
            if (result) return endGame(result, updated);
            setCells(updated);
            return;
        }

        const i = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        const updated = [...currentCells];
        updated[i] = 'O';
        const result = checkWinner(updated);
        if (result) return endGame(result, updated);
        setCells(updated);
    };

    const endGame = (result: Cell | 'draw', updatedCells: Cell[]) => {
        setCells(updatedCells);
        setWinner(result);
        setGameOver(true);

        if (result === 'X') {
            confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.6 }
            });
        }
    };

    const resetGame = () => {
        setIsFading(true);
        setTimeout(() => {
            setCells(Array(9).fill(null));
            setGameOver(false);
            setWinner(null);
            setWinningLine([]);
            setIsResetting(false);
            setIsFading(false);
        }, 600); // Wait for fade-out animation
    };

    const getResultMessage = () => {
        if (winner === 'X') return '🎉 Вы выиграли!';
        if (winner === 'O') return '😢 Увы, не повезло';
        if (winner === 'draw') return '🤝 Ничья';
        return '';
    };

    return (
        <div className="app-container">
            <div className={`result-banner ${isGameOver ? 'visible' : ''}`}>
                {getResultMessage()}
            </div>
            <div className="app">
                <h1>Tic Tac Toe</h1>
                <GameBoard
                    cells={cells}
                    onCellClick={handleCellClick}
                    winningLine={winningLine}
                    isResetting={isResetting}
                    isFading={isFading} // Pass to GameBoard
                />
                <div className="result">
                    <button onClick={resetGame} className="restart-button">
                        <Lottie
                            animationData={gameAnimation}
                            loop={true}
                            style={{ width: 40, height: 40 }}
                        />
                        Играть снова
                    </button>
                </div>
            </div>
        </div>
    );
}

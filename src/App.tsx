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
    const [isFading, setIsFading] = useState(false);
    const [isInputBlocked, setIsInputBlocked] = useState(false); // NEW
    const [fadingCells, setFadingCells] = useState<boolean[]>(Array(9).fill(false)); // NEW

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
        if (cells[index] || isGameOver || isFading || isInputBlocked) return;

        const nextCells = [...cells];
        nextCells[index] = 'X';

        // Block input during the animation
        setIsInputBlocked(true);
        setTimeout(() => setIsInputBlocked(false), 600); // Block input for 600ms

        const result = checkWinner(nextCells);
        if (result) {
            endGame(result, nextCells);
            return;
        }

        setCells(nextCells);
        setTimeout(() => makeComputerMove(nextCells), 600); // Wait for X animation to finish
    };

    const makeComputerMove = (currentCells: Cell[]) => {
        const emptyIndices = currentCells
            .map((cell, i) => (cell === null ? i : null))
            .filter(i => i !== null) as number[];

        let updated: Cell[] = [];

        const tryMove = (i: number) => {
            updated = [...currentCells];
            updated[i] = 'O';
            const result = checkWinner(updated);
            if (result) {
                endGame(result, updated);
            } else {
                setCells(updated);
            }
        };

        const randomChance = Math.random();

        if (randomChance < 0.5) {
            const i = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            tryMove(i);
        } else {
            for (let i of emptyIndices) {
                const temp = [...currentCells];
                temp[i] = 'O';
                if (checkWinner(temp) === 'O') return tryMove(i);
            }

            for (let i of emptyIndices) {
                const temp = [...currentCells];
                temp[i] = 'X';
                if (checkWinner(temp) === 'X') return tryMove(i);
            }

            if (currentCells[4] === null) return tryMove(4);

            const corners = [0, 2, 6, 8];
            const freeCorners = corners.filter(i => currentCells[i] === null);
            if (freeCorners.length > 0) {
                const i = freeCorners[Math.floor(Math.random() * freeCorners.length)];
                return tryMove(i);
            }

            const i = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
            tryMove(i);
        }

        setIsInputBlocked(true);
        setTimeout(() => setIsInputBlocked(false), 600);
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
        // Set fade-out flags for all non-null cells
        const fadeFlags = cells.map(cell => cell !== null);
        setFadingCells(fadeFlags);

        setTimeout(() => {
            setCells(Array(9).fill(null));
            setFadingCells(Array(9).fill(false)); // Reset fade-out state
            setGameOver(false);
            setWinner(null);
            setWinningLine([]);
            setIsResetting(false);
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
                    fadingCells={fadingCells} // Pass fadingCells to GameBoard
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

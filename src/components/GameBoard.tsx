import { useMemo } from 'react';
import { Cell } from '@/App';
import Lottie from 'lottie-react';
import crossAnimation from '../assets/cross.json';
import ovalAnimation from '../assets/oval.json';
import gridAnimation from '../assets/grid.json';

type GameBoardProps = {
    cells: Cell[];
    onCellClick: (index: number) => void;
    winningLine: number[];
    isResetting: boolean;
    fadingCells?: boolean[]; // NEW
};

const clickZones = [
    { x: '20%', y: '20%' }, { x: '50%', y: '22%' }, { x: '80%', y: '22%' },
    { x: '20%', y: '50%' }, { x: '50%', y: '50%' }, { x: '80%', y: '50%' },
    { x: '20%', y: '80%' }, { x: '50%', y: '80%' }, { x: '80%', y: '80%' },
];

export default function GameBoard({ cells, onCellClick, winningLine, fadingCells }: GameBoardProps) {
    const grid = useMemo(() => (
        <Lottie
            animationData={gridAnimation}
            loop={false}
            className="grid-animation"
        />
    ), []);

    return (
        <div className="game-container">
            {grid}
            <div className="click-zones">
                {clickZones.map((pos, index) => (
                    <div
                        key={index}
                        className="click-zone"
                        style={{ left: pos.x, top: pos.y }}
                        onClick={() => onCellClick(index)}
                    >
                        {cells[index] && (
                            <Lottie
                                animationData={cells[index] === 'X' ? crossAnimation : ovalAnimation}
                                loop={false}
                                autoPlay={true}
                                className={`symbol-animation ${winningLine.includes(index) ? 'blink' : ''} ${fadingCells?.[index] ? 'fade-out' : ''}`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

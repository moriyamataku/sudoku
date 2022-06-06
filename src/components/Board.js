import Square from "./Square";
import { BoardX, BoardY, BoardRowX, BoardRowY } from '../reducers/Calculation';

const Board = props => {
  const squarePos = (posX, posY) => {
    const x = (props.posX - 1) * BoardRowX + posX - 1;
    const y = (props.posY - 1) * BoardRowY + posY - 1;
    return [x, y];
  }

  const renderSquare = (x, y) => {
    const [squarePosX, squarePosY] = squarePos(x, y);
    return (
      <Square 
        key={`x${x}y${y}`}
        posX={squarePosX} posY={squarePosY}
      />
    )
  }

  return (
    <div className="board-group">
      { BoardY.map((y) => {
          return (
            <div key={y} className="board">
              { BoardX.map((x) => (renderSquare(x, y))) }
            </div>
          )
        })
      }
    </div>
  );
}

export default Board;

import { useReducer, useCallback, createContext } from 'react';
import { useDropzone } from 'react-dropzone'
import './Game.css';
import Board from './Board';
import { BoardX, BoardY } from '../reducers/Calculation';
import { initialGameState, gameReducer } from '../reducers/GameReducer';

export const GameContext = createContext();

const Game = () => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)

  const onReset = () => {
    dispatch({ type: 'RESET_GAME' })
  }

  const onStart = () => {
    dispatch({ type: 'START_CALCULATION' })
  }

  const onExport = async () => {
    const data = state.values.map(row => {
      return row.map(value => typeof(value) === 'string' ? value : 0)
    })
    const blob = new Blob([JSON.stringify(data)],{type:'application/json'});
    const href = await URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `sudoku_${new Date().toISOString().replace(/(T|:|-|_)/g, '').substring(0, 14)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        const jsonText = reader.result
        dispatch({ type: 'SET_VALUES', payload: { values:JSON.parse(jsonText) }})
      }
      reader.readAsText(file)
    })
  }, [])
  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return (
    <GameContext.Provider value={{ state, dispatch }} >
      <div className="game">
        { BoardX.map((x) => {
          return (
            <div key={x} className="game-board">
              { BoardY.map(y => (<Board key={`x${x}y${y}`} posX={x} posY={y} />))}
            </div>
          )
        })}
        <div className="game-info">
          <div className="action">
            <button className="action-button" onClick={onReset}>
              Reset
            </button>
          </div>
          <div className="action">
            <button className="action-button" onClick={onStart}>
              Start
            </button>
          </div>
          <div className="action">
            <button className="action-button" onClick={onExport}>
              Export
            </button>
            <div {...getRootProps()} className="import-button" >
              <input {...getInputProps()} />
              <p className="import-text">Import</p>
            </div>
          </div>
          { state.status !== 'initial' &&
            <div className="action">
              <p className="import-text">{state.status}</p>
            </div>
          }
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    </GameContext.Provider>
  );
}

export default Game;

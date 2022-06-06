import { useContext } from "react";
import { GameContext } from "./Game";

const Square = props => {
  const { state, dispatch } = useContext(GameContext);
  const { posX, posY } = props;

  const onClick = () => {
    dispatch({ type: 'SELECT_SQUARE', payload: { x: posX, y: posY }})
  }

  const onChange = event => {
    const intValue = parseInt(event.target.value);
    if (isNaN(intValue) || intValue < 0 || intValue > 9) {
      dispatch({ type: 'SET_VALUE', payload: { x: posX, y: posY, value: 0}})
      return;
    }
    dispatch({ type: 'SET_VALUE', payload: { x: posX, y: posY, value: event.target.value}})
  }

  const { values, candidates, selected } = state;
  const preset = typeof(values[posY][posX]) === 'string'
  const value = values[posY][posX] || ''
  const candidate = candidates[posY][posX] || []
  const isSelected = (selected.x === posX && selected.y === posY)

  let className = "square";
  if (isSelected) className += " selected";
  if (!preset) className += " caliculated";
  if (!isSelected && value === '' && candidate.length !== 0)
    return (
      <p className="square-candidate" onClick={onClick} >{candidate.join(',')}</p>
    )
  else
    return (
      <input
        className={className} 
        type="number" 
        min="0"
        max="9"
        onClick={onClick} 
        onChange={onChange} 
        value={value} 
      />
    )
}

export default Square;

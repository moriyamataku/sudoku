import { initValues, initCandidates, calculateWithSimulate } from "./Calculation";

export const initialGameState = {
  values: JSON.parse(JSON.stringify(initValues)),
  candidates: JSON.parse(JSON.stringify(initCandidates)),
  selected: { posX: null, posY: null },
  status: 'initial'
};

export const gameReducer = (state, action) => {
  switch (action.type) {
    case 'RESET_GAME':
      return {
        values: JSON.parse(JSON.stringify(initValues)),
        candidates: JSON.parse(JSON.stringify(initCandidates)),
        selected: { posX: null, posY: null },
        status: 'initial'
      };
    case 'SELECT_SQUARE':
      return { ...state, selected: action.payload }
    case 'START_CALCULATION':
      const [status, values, candidates] = calculateWithSimulate(state.values)
      return { ...state, status, values, candidates }
    case 'SET_VALUE':
      {
        const {x, y, value} = action.payload;
        const newValues = state.values.concat();
        newValues[y][x] = value;
        const newCandidates = state.candidates.concat();
        newCandidates[y][x] = [];
        return { ...state, status: 'initial',values: newValues, candidates: newCandidates }
      }
    case 'SET_VALUES':
      return { ...state, status: 'initial', values: action.payload.values, candidates: JSON.parse(JSON.stringify(initCandidates)), selected: { posX: null, posY: null } }
    default:
      return state;
  }
}


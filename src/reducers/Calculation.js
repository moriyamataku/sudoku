export const BoardX = [1, 2, 3],
             BoardY = [1, 2, 3];
export const BoardRowX = 3,
             BoardRowY = 3;
const RowX = 9,
      RowY = 9;

export const initValues =
new Array(RowX);
for (let i = 0; i < initValues.length; i++) {
  initValues[i] = new Array(RowY).fill(0);
}

export const initCandidates = new Array(RowX);
for (let i = 0; i < initCandidates.length; i++) {
  initCandidates[i] = new Array(RowY);
  for (let j = 0; j < initCandidates[i].length; j++) {
    initCandidates[i][j] = [];
  }
}

export const calculateWithSimulate = (values) => {
  const main = new Calculation(values, true);
  let status;
  do {
    status = main.calculate();
    console.log(`calculate result -> ${status}`);
    if (status === 'uncompleted') {
      const results = main.getResults().filter(result => result.value === 0 && result.candidates.length > 1);

      for (let result of results) {
        const simulators = generateSimulators(main.getValues(), result.x, result.y, result.candidates)
        // console.log(`x:${result.x}, y:${result.x}, cadidates:${result.candidates}`);
        if(simulators.some(s => s.getStatus() === 'completed')) {
          console.log("find answer");
          const answer = simulators.find(s => s.getStatus() === 'completed');
          return ['completed', answer.getValues(), answer.getCandidates()];
        }
      }
      let find_forward = false;
      for (let result of results) {
        const simulators = generateSimulators(main.getValues(), result.x, result.y, result.candidates)
        if(simulators.filter(s => s.getStatus() === 'uncompleted').length === 1) {
          console.log("find forward");
          const forward = simulators.find(s => s.getStatus() === 'uncompleted');
          main.setValues(forward.getValues());
          find_forward = true
          break;
        }
      }
      if (!find_forward) {
        // console.log("find nothing");
        return [status, main.getValues(), main.getCandidates()]
      }
    }
  } while (status === 'uncompleted')
  return [status, main.getValues(), main.getCandidates()]
}

const generateSimulators = (values, x, y, candidates) => {
  return candidates.map(candidate => {
    const simulator = new Calculation(values);
    simulator.setValue(x, y, candidate);
    simulator.calculate();
    return simulator;
  })
}

class Calculation {
  constructor(srcValues, isMain=false) {
    this.isMain=isMain;
    this.values = JSON.parse(JSON.stringify(srcValues));
    this.resetCandidate();
  }

  setValues(values) {
    this.values = JSON.parse(JSON.stringify(values));
  }

  getValues() {
    return JSON.parse(JSON.stringify(this.values));;
  }

  getCandidates() {
    return JSON.parse(JSON.stringify(this.candidates));
  }

  getResults() {
    return this.values.map((valueRow, y) => {
      return valueRow.map((value, x) => {
        return { x, y, value, candidates: this.candidates[y][x] }
      })
    }).flat();
  }

  getStatus() {
    const results = this.getResults();
    if (results.every(v => v.value !== 0)) {
      return 'completed';
    } else if (results.some(v => v.value === 0 && v.candidates.length === 0)) {
      return 'error';
    } else {
      return 'uncompleted';
    }
  }

  log(message) {
    if (this.isMain) console.log(message);
  }

  setValue(x, y, value) {
    // this.log(`x:${x+1} y:${y+1} -> ${value}`);
    this.values[y][x] = value;
    this.candidates[y][x] = [];
  }

  setCandidate(x, y, value) {
    this.candidates[y][x] = value;
  }

  resetCandidate() {
    this.candidates = JSON.parse(JSON.stringify(initCandidates));
  }

  calculate() {
    let desided;
    let count = 0;
    do {
      count += 1;
      desided = false;
      this.resetCandidate();
      // this.log('desideNumber');
      for (let i = 0; i < RowX; i++) {
        for (let j = 0; j < RowY; j++) {
          if(this.values[j][i] !== 0) continue;
          if(this.desideNumber(i, j)) desided = true;
        }
      }
      if (!desided) {
        // this.log('desideFromCandidatesDuplicate');
        desided = this.desideFromCandidatesDuplicate();
      }
      if (!desided) {
        // this.log('desideFromCandidatesOnlyOne');
        desided = this.desideFromCandidatesOnlyOne();
      }
    } while (desided && count < RowX * RowY);
    return this.getStatus();
  }

  desideNumber(x, y) {
    let whole = Array.from(Array(9), (v, k) => k + 1);

    // line
    for (let i = 0; i < RowX; i++) {
      if(this.values[y][i] !== 0) {
        whole = whole.filter(n => n !== parseInt(this.values[y][i]))
      }
    }
    // column
    for (let j = 0; j < RowY; j++) {
      if(this.values[j][x] !== 0) {
        whole = whole.filter(n => n !== parseInt(this.values[j][x]))
      }
    }
    // 3x3 box
    const boardX = Math.floor(x / BoardRowX);
    const boardY = Math.floor(y / BoardRowY);

    for (let i = boardX * BoardRowX; i < (boardX + 1) * BoardRowX; i++) {
      for (let j = boardY * BoardRowY; j < (boardY + 1) * BoardRowY; j++) {
        if (x === i && y === j) continue;
        if(this.values[j][i] !== 0) {
          whole = whole.filter(num => num !== parseInt(this.values[j][i]));
        }
      }
    }

    if (whole.length === 1) {
      this.setValue(x, y, whole[0]);
      return true;
    } else {
      this.setCandidate(x, y, whole);
      return false;
    }
  }

  desideFromCandidatesDuplicate() {
    let result = false;
    // line
    for (let i = 0; i < RowX && !result; i++) {
      if (this.deleteDuplicateAndDesideOne([i], Array.from(Array(9), (v, k) => k))) {
        result = true;
      }
    }

    // column
    for (let j = 0; j < RowY && !result; j++) {
      if (this.deleteDuplicateAndDesideOne(Array.from(Array(9), (v, k) => k), [j])) {
        result = true;
      }
    }

    // 3x3 box
    for(let boardX = 0; boardX < BoardRowX && !result; boardX++) {
      for(let boardY = 0; boardY < BoardRowY && !result; boardY++) {
        if (this.deleteDuplicateAndDesideOne(
          Array.from(Array(3), (v, k) => boardX * 3 + k),
          Array.from(Array(3), (v, k) => boardY * 3 + k))) {
            result = true;
        }
      };
    };

    return result;
  }

  desideFromCandidatesOnlyOne() {
    let result = false;
    // 3x3 box
    for(let boardX = 0; boardX < BoardRowX && !result; boardX++) {
      for(let boardY = 0; boardY < BoardRowY && !result; boardY++) {
        if (this.searchOnlyOneAndDeside(
          Array.from(Array(3), (v, k) => boardX * 3 + k),
          Array.from(Array(3), (v, k) => boardY * 3 + k))) {
          result = true;
        }
      };
    };
    return result;
  }

  deleteDuplicateAndDesideOne(xRange, yRange) {
    let targets = [];
    let changed = false;
    xRange.forEach(i => {
      yRange.forEach(j => {
        targets.push(this.candidates[j][i])
      })
    });
    const duplicates = this.checkDuplicate(targets);
    if (duplicates) {
      xRange.forEach(i => {
        yRange.forEach(j => {
          const minusValues = this.candidates[j][i].filter(c => !duplicates.includes(c))
          if (minusValues.length === 1) {
            this.setValue(i, j, minusValues[0]);
            changed = true;
          }
        })
      });
    }
    return changed;
  }

  checkDuplicate(targets) {
    const tmp = targets.map(t => t.join("-"));
    let found = false;
    tmp.forEach((t, i) => {
      if (t !== "") {
        if ((tmp.indexOf(t) !== tmp.lastIndexOf(t)) && targets[i].length === 2) {
          found = targets[i].concat();
        }
      }
    });
    return found
  }

  searchOnlyOneAndDeside(xRange, yRange) {
    let targets = [];
    let changed = false;
    xRange.forEach(i => {
      yRange.forEach(j => {
        targets.push(this.candidates[j][i])
      })
    });
    // console.log(`xRange:${xRange} yRange:${yRange} ${targets}`);
    const counts = targets.flat().reduce((result, target) => {
      result[target] ? result[target] += 1 : result[target] = 1
      return result
    },{});
    let oneValues = []
    for (const [key, value] of Object.entries(counts)) {
      if (value === 1) {
        oneValues.push(parseInt(key));
      }
    }
    if (oneValues.length > 0) {
      // console.log(`oneValues: ${oneValues}`);
      oneValues.forEach(oneValue => {
        xRange.forEach(i => {
          yRange.forEach(j => {
            targets.push(this.candidates[j][i])
            if (this.candidates[j][i].includes(oneValue)) {
              this.setValue(i, j, oneValue);
              changed = true;
              // console.log(`x:${i+1},y:${j+1}->${oneValue}`);
            }
          })
        })
      })
    }
    return changed;
  }
}

export default Calculation;

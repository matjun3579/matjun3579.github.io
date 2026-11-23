(function () {
  const ROWS = 15;
  const COLS = 15;
  const ANIMATION_DELAY = 18;

  let mode = "start";
  let startCell = { row: 7, col: 2 };
  let endCell = { row: 7, col: 12 };
  let walls = new Set();
  let searching = false;
  let animationToken = 0;

  const gridElement = document.getElementById("grid");
  const statusElement = document.getElementById("status");
  const startButton = document.getElementById("start-bfs");
  const resetButton = document.getElementById("reset-grid");
  const modeButtons = Array.from(document.querySelectorAll(".mode-button"));

  gridElement.style.setProperty("--cols", COLS);

  function cellKey(row, col) {
    return `${row}-${col}`;
  }

  function createGrid() {
    gridElement.replaceChildren();
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cell";
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("aria-label", `${row + 1}행 ${col + 1}열`);
        cell.addEventListener("click", handleCellClick);
        gridElement.appendChild(cell);
      }
    }
    renderGrid();
  }

  function getCell(row, col) {
    return gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  function clearSearchClasses() {
    gridElement.querySelectorAll(".visited, .path").forEach((cell) => {
      cell.classList.remove("visited", "path");
    });
  }

  function renderGrid() {
    gridElement.querySelectorAll(".cell").forEach((cell) => {
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      const key = cellKey(row, col);
      cell.className = "cell";
      if (walls.has(key)) cell.classList.add("wall");
      if (startCell && row === startCell.row && col === startCell.col) cell.classList.add("start");
      if (endCell && row === endCell.row && col === endCell.col) cell.classList.add("end");
    });
  }

  function handleCellClick(event) {
    if (searching) return;

    const cell = event.currentTarget;
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const key = cellKey(row, col);
    clearSearchClasses();

    if (mode === "start") {
      if (endCell && endCell.row === row && endCell.col === col) {
        statusElement.textContent = "출발점과 도착점은 같은 칸에 둘 수 없습니다.";
        return;
      }
      walls.delete(key);
      startCell = { row, col };
      statusElement.textContent = "출발점을 설정했습니다.";
    } else if (mode === "end") {
      if (startCell && startCell.row === row && startCell.col === col) {
        statusElement.textContent = "출발점과 도착점은 같은 칸에 둘 수 없습니다.";
        return;
      }
      walls.delete(key);
      endCell = { row, col };
      statusElement.textContent = "도착점을 설정했습니다.";
    } else if (mode === "wall") {
      if ((startCell && startCell.row === row && startCell.col === col) ||
          (endCell && endCell.row === row && endCell.col === col)) {
        statusElement.textContent = "출발점과 도착점에는 벽을 만들 수 없습니다.";
        return;
      }
      walls.add(key);
    } else if (mode === "erase") {
      walls.delete(key);
    }

    renderGrid();
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (searching) return;
      mode = button.dataset.mode;
      modeButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
    });
  });

  function sleep(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  async function runBfs() {
    if (searching) return;
    if (!startCell || !endCell) {
      statusElement.textContent = "출발점과 도착점을 모두 설정하세요.";
      return;
    }

    searching = true;
    animationToken += 1;
    const token = animationToken;
    startButton.disabled = true;
    resetButton.disabled = false;
    modeButtons.forEach((button) => { button.disabled = true; });
    clearSearchClasses();

    const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    const previous = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    const startIndex = startCell.row * COLS + startCell.col;
    const queue = [startIndex];
    let head = 0;
    visited[startCell.row][startCell.col] = true;

    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1]
    ];
    let found = false;

    statusElement.textContent = "BFS 탐색을 시작합니다.";

    while (head < queue.length) {
      if (token !== animationToken) return;

      const currentIndex = queue[head];
      head += 1;
      const row = Math.floor(currentIndex / COLS);
      const col = currentIndex % COLS;

      if (row === endCell.row && col === endCell.col) {
        found = true;
        break;
      }

      if (!(row === startCell.row && col === startCell.col)) {
        const currentCell = getCell(row, col);
        if (currentCell) currentCell.classList.add("visited");
      }

      for (const [dr, dc] of directions) {
        const nextRow = row + dr;
        const nextCol = col + dc;
        if (nextRow < 0 || nextRow >= ROWS || nextCol < 0 || nextCol >= COLS) continue;
        if (visited[nextRow][nextCol]) continue;
        if (walls.has(cellKey(nextRow, nextCol))) continue;

        visited[nextRow][nextCol] = true;
        previous[nextRow][nextCol] = { row, col };
        queue.push(nextRow * COLS + nextCol);
      }

      await sleep(ANIMATION_DELAY);
    }

    if (token !== animationToken) return;

    if (!found) {
      statusElement.textContent = "도착점까지 이동할 수 없습니다. 벽을 확인하거나 지워 주세요.";
      finishSearch();
      return;
    }

    const path = [];
    let cursor = { row: endCell.row, col: endCell.col };
    while (cursor) {
      path.push(cursor);
      if (cursor.row === startCell.row && cursor.col === startCell.col) break;
      cursor = previous[cursor.row][cursor.col];
    }

    path.reverse();
    for (const position of path) {
      if (token !== animationToken) return;
      if (!(position.row === startCell.row && position.col === startCell.col) &&
          !(position.row === endCell.row && position.col === endCell.col)) {
        getCell(position.row, position.col).classList.add("path");
      }
      await sleep(ANIMATION_DELAY);
    }

    if (token !== animationToken) return;
    const moveCount = path.length - 1;
    statusElement.textContent = `최단 경로를 찾았습니다. 이동 횟수: ${moveCount}번`;
    finishSearch();
  }

  function finishSearch() {
    searching = false;
    startButton.disabled = false;
    modeButtons.forEach((button) => { button.disabled = false; });
  }

  function resetGrid() {
    animationToken += 1;
    searching = false;
    startButton.disabled = false;
    modeButtons.forEach((button) => { button.disabled = false; });
    walls.clear();
    startCell = { row: 7, col: 2 };
    endCell = { row: 7, col: 12 };
    mode = "start";
    modeButtons.forEach((button) => {
      const active = button.dataset.mode === "start";
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    clearSearchClasses();
    renderGrid();
    statusElement.textContent = "격자를 초기화했습니다. 출발점과 도착점을 다시 설정해 보세요.";
  }

  startButton.addEventListener("click", runBfs);
  resetButton.addEventListener("click", resetGrid);

  document.querySelector(".nav-toggle").addEventListener("click", (event) => {
    const links = document.getElementById("nav-links");
    const open = links.classList.toggle("open");
    event.currentTarget.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      document.getElementById("nav-links").classList.remove("open");
      document.querySelector(".nav-toggle").setAttribute("aria-expanded", "false");
    });
  });
  document.getElementById("year").textContent = new Date().getFullYear();

  createGrid();
})();

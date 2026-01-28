/*
 * Copyright (c) 2026 Gabriel Horakhty / SoftIndie.
 * Todos os direitos reservados.
 * * Este código é confidencial e proprietário.
 * A cópia não autorizada deste arquivo, via qualquer meio, é estritamente proibida.
 */
/* ================= GERENCIAMENTO DE JANELAS ================= */
let zIndexCounter = 100;

// Função global para abrir janelas
window.openWindow = function(id) {
    const win = document.getElementById(id);
    
    if (win) {
        win.style.display = 'flex';
        win.style.zIndex = ++zIndexCounter;
        
        // Traz para frente ao clicar
        win.onclick = () => { win.style.zIndex = ++zIndexCounter; };
        
        // Centralização responsiva (Mobile)
        if(window.innerWidth < 768 && win.classList.contains('large')) {
             win.style.top = '50%';
             win.style.left = '50%';
             win.style.transform = 'translate(-50%, -50%)';
             win.style.maxHeight = '90vh';
        }
    } else {
        console.error("Janela não encontrada: " + id);
    }

    // Fecha o menu iniciar ao abrir qualquer app
    const startMenu = document.getElementById('start-menu');
    if(startMenu) startMenu.style.display = 'none';
}

// Função global para fechar janelas
window.closeWindow = function(id) {
    const win = document.getElementById(id);
    if(win) win.style.display = 'none';
    
    // Se fechar o jogo do gatinho, para o jogo
    if(id === 'app-dino') {
        window.stopDino();
    }
}

// Menu Iniciar
window.toggleStartMenu = function() {
    const menu = document.getElementById('start-menu');
    if(menu) {
        menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    }
}

window.closeStartMenu = function() {
    const menu = document.getElementById('start-menu');
    if(menu) menu.style.display = 'none';
}

// Fechar menu iniciar ao clicar fora
document.addEventListener('click', function(event) {
    const menu = document.getElementById('start-menu');
    const startBtn = document.querySelector('.start-btn');
    if (menu && startBtn) {
        if (!menu.contains(event.target) && !startBtn.contains(event.target)) {
            menu.style.display = 'none';
        }
    }
});

/* ================= RELÓGIO ================= */
function updateClock() {
    const now = new Date();
    const timeElem = document.getElementById('clock-time');
    if(timeElem) {
        timeElem.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
}
setInterval(updateClock, 1000);
updateClock();

/* ================= CALCULADORA (CORRIGIDA) ================= */
// Mantemos a expressão fora das funções para não perder o valor
let calcExpression = '';

window.calcInput = function(val) {
    const display = document.getElementById('calc-display');
    if(display) {
        calcExpression += val; 
        display.value = calcExpression;
    }
};

window.calcOp = function(op) {
    const display = document.getElementById('calc-display');
    if(display) {
        calcExpression += op; 
        display.value = calcExpression;
    }
};

window.calcClear = function() {
    const display = document.getElementById('calc-display');
    if(display) {
        calcExpression = ''; 
        display.value = '';
    }
};

window.calcResult = function() {
    const display = document.getElementById('calc-display');
    if(display) {
        try { 
            // Avalia a conta e atualiza o display
            const result = eval(calcExpression); 
            display.value = result; 
            calcExpression = result.toString(); // Permite continuar a conta
        } catch { 
            display.value = 'Erro'; 
            calcExpression = '';
        }
    }
};

/* ================= JOGO: CAMPO MINADO ================= */
const gridMines = document.getElementById("mines-grid"); // Renomeado para evitar conflito
const width = 9;
const bombAmount = 10;
let squares = [];
let isGameOverMines = false;

window.initMinesweeper = function() {
    const grid = document.getElementById("mines-grid"); // Busca segura
    if(!grid) return;
    
    grid.innerHTML = "";
    squares = [];
    isGameOverMines = false;
    
    const btnReset = document.querySelector('.btn-reset');
    if(btnReset) btnReset.textContent = '😐';
    
    const scoreBoard = document.getElementById('mines-score');
    if(scoreBoard) scoreBoard.textContent = 'BOMBAS: ' + bombAmount;

    // Lógica de espalhar bombas
    const bombsArray = Array(bombAmount).fill('bomb');
    const emptyArray = Array(width * width - bombAmount).fill('valid');
    const gameArray = emptyArray.concat(bombsArray);
    const shuffledArray = gameArray.sort(() => Math.random() - 0.5);

    for(let i = 0; i < width * width; i++) {
        const square = document.createElement('div');
        square.setAttribute('id', i);
        square.classList.add('mine-cell');
        square.dataset.type = shuffledArray[i];
        grid.appendChild(square);
        squares.push(square);

        // Eventos de clique
        square.addEventListener('click', function(e) { clickMine(square); });
        square.oncontextmenu = function(e) { e.preventDefault(); addFlag(square); }
    }

    // Calcular números ao redor
    for (let i = 0; i < squares.length; i++) {
        let total = 0;
        const isLeftEdge = (i % width === 0);
        const isRightEdge = (i % width === width - 1);

        if (squares[i].dataset.type === 'valid') {
            if (i > 0 && !isLeftEdge && squares[i - 1].dataset.type === 'bomb') total++;
            if (i > 8 && !isRightEdge && squares[i + 1 - width].dataset.type === 'bomb') total++;
            if (i > 9 && squares[i - width].dataset.type === 'bomb') total++;
            if (i > 10 && !isLeftEdge && squares[i - 1 - width].dataset.type === 'bomb') total++;
            if (i < 80 && !isRightEdge && squares[i + 1].dataset.type === 'bomb') total++;
            if (i < 72 && !isLeftEdge && squares[i - 1 + width].dataset.type === 'bomb') total++;
            if (i < 71 && !isRightEdge && squares[i + 1 + width].dataset.type === 'bomb') total++;
            if (i < 72 && squares[i + width].dataset.type === 'bomb') total++;
            squares[i].setAttribute('data', total);
        }
    }
}

function addFlag(square) {
    if (isGameOverMines) return;
    if (!square.classList.contains('revealed')) {
        if (!square.classList.contains('flag')) {
            square.classList.add('flag');
            square.innerHTML = '🚩';
        } else {
            square.classList.remove('flag');
            square.innerHTML = '';
        }
    }
}

function clickMine(square) {
    if (isGameOverMines) return;
    if (square.classList.contains('revealed') || square.classList.contains('flag')) return;

    if (square.dataset.type === 'bomb') {
        gameOverMines();
    } else {
        let total = square.getAttribute('data');
        if (total != 0) {
            square.classList.add('revealed');
            square.innerHTML = total;
            square.style.color = getNumberColor(total);
            return;
        }
        checkSquare(square, parseInt(square.id));
    }
    square.classList.add('revealed');
}

function checkSquare(square, currentId) {
    const isLeftEdge = (currentId % width === 0);
    const isRightEdge = (currentId % width === width - 1);

    setTimeout(() => {
        if (currentId > 0 && !isLeftEdge) { const newId = squares[currentId - 1].id; const newSquare = document.getElementById(newId); clickMine(newSquare); }
        if (currentId > 8 && !isRightEdge) { const newId = squares[currentId + 1 - width].id; const newSquare = document.getElementById(newId); clickMine(newSquare); }
        if (currentId > 9) { const newId = squares[currentId - width].id; const newSquare = document.getElementById(newId); clickMine(newSquare); }
        if (currentId > 10 && !isLeftEdge) { const newId = squares[currentId - 1 - width].id; const newSquare = document.getElementById(newId); clickMine(newSquare); }
        if (currentId < 80 && !isRightEdge) { const newId = squares[currentId + 1].id; const newSquare = document.getElementById(newId); clickMine(newSquare); }
        if (currentId < 72 && !isLeftEdge) { const newId = squares[currentId - 1 + width].id; const newSquare = document.getElementById(newId); clickMine(newSquare); }
        if (currentId < 71 && !isRightEdge) { const newId = squares[currentId + 1 + width].id; const newSquare = document.getElementById(newId); clickMine(newSquare); }
        if (currentId < 72) { const newId = squares[currentId + width].id; const newSquare = document.getElementById(newId); clickMine(newSquare); }
    }, 10);
}

function gameOverMines() {
    isGameOverMines = true;
    const btnReset = document.querySelector('.btn-reset');
    if(btnReset) btnReset.textContent = '😵';
    
    squares.forEach(square => {
        if (square.dataset.type === 'bomb') {
            square.innerHTML = '💣';
            square.classList.add('bomb');
        }
    });
}

function getNumberColor(num) {
    if (num == 1) return 'blue'; 
    if (num == 2) return 'green'; 
    if (num == 3) return 'red'; 
    return 'purple';
}

/* ================= JOGO: GATINHO RUN ================= */
const dino = document.getElementById("dino");
const cactus = document.getElementById("cactus");
const scoreElement = document.getElementById("dino-score");
const gameOverMsg = document.getElementById("game-over-msg");

let isDinoJumping = false;
let isDinoGameOver = false;
let dinoScore = 0;
let scoreInterval;
let checkDeadInterval;

window.startDino = function() {
    isDinoGameOver = false;
    dinoScore = 0;
    
    if(gameOverMsg) gameOverMsg.style.display = 'none';
    
    if(cactus) {
        cactus.classList.remove('cactus-move');
        void cactus.offsetWidth; // Reset animation trigger
        cactus.classList.add('cactus-move');
    }
    
    clearInterval(scoreInterval);
    clearInterval(checkDeadInterval);

    if(scoreElement) scoreElement.textContent = "SCORE: 00000";

    scoreInterval = setInterval(() => {
        dinoScore++;
        if(scoreElement) {
            let formattedScore = String(dinoScore).padStart(5, '0');
            scoreElement.textContent = "SCORE: " + formattedScore;
        }
    }, 100);

    checkDeadInterval = setInterval(checkCollision, 10);
}

window.dinoJump = function() {
    if(isDinoGameOver) return;
    if(dino && !dino.classList.contains("animate-jump")) {
        dino.classList.add("animate-jump");
        isDinoJumping = true;
        setTimeout(function(){
            dino.classList.remove("animate-jump");
            isDinoJumping = false;
        }, 600); 
    }
}

window.stopDino = function() {
    isDinoGameOver = true;
    if(cactus) cactus.classList.remove("cactus-move");
    clearInterval(scoreInterval);
    clearInterval(checkDeadInterval);
}

document.addEventListener('keydown', (event) => {
    const dinoWindow = document.getElementById('app-dino');
    // Só pula se a janela do Gatinho estiver visível
    if (event.code === 'Space' && dinoWindow && dinoWindow.style.display === 'flex') {
        event.preventDefault(); 
        window.dinoJump();
    }
});

function checkCollision() {
    if(!cactus || !dino) return;
    let cactusLeft = parseInt(window.getComputedStyle(cactus).getPropertyValue("left"));
    let dinoBottom = parseInt(window.getComputedStyle(dino).getPropertyValue("bottom"));

    // Ajuste de colisão
    if(cactusLeft > 5 && cactusLeft < 35 && dinoBottom < 30) {
        window.stopDino();
        if(gameOverMsg) gameOverMsg.style.display = 'block';
    }
}

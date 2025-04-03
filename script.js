const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const imgCabeca = new Image();
imgCabeca.src = "png/cabeca.png";

const imgCorpo = new Image();
imgCorpo.src = "png/corpo.png";

const imgComida = new Image();
imgComida.src = "png/comida.webp"; // Nome correto do arquivo

const somComer = new Audio("som/comer.mp3"); // Som ao comer

const somBater = new Audio("som/bater.mp3"); // Som ao bater


somComer.volume = 0.2;  // Volume 50%
somBater.volume = 0.5;  // Volume 80%


const gridSize = 40;
let snake = [
    { x: 160, y: 160 },
    { x: 140, y: 160 }
];
let direction = 'RIGHT';
let gameOver = false;
let food = { x: 0, y: 0 };
let gameStarted = false;
let foodEaten = 0; // Contador de comidas
let speed = 150; // Velocidade inicial (ms)


const muteButton = document.getElementById("muteButton");
const muteIcon = document.getElementById("muteIcon");
let isMuted = false; // Som começa ligado

function toggleMute() {
    isMuted = !isMuted; // Alterna entre ligado e mutado

    // Ajusta o volume dos sons
    somComer.volume = isMuted ? 0 : 0.2;
    somBater.volume = isMuted ? 0 : 0.8;

    // Troca a imagem do botão
    muteIcon.src = isMuted ? "png/sem-som.png" : "png/volume.png";
}

// Adiciona evento de clique ao botão
muteButton.addEventListener("click", toggleMute);


// Adiciona evento de clique ao botão
muteButton.addEventListener("click", toggleMute);



document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);
document.addEventListener("touchmove", function (event) {
    if (event.touches.length === 1) {
        event.preventDefault(); // Impede a rolagem padrão
    }
}, { passive: false });


let xDown = null;
let yDown = null;

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    let xUp = evt.touches[0].clientX;
    let yUp = evt.touches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0 && direction !== 'RIGHT') {
            direction = 'LEFT';
        } else if (xDiff < 0 && direction !== 'LEFT') {
            direction = 'RIGHT';
        }
    } else {
        if (yDiff > 0 && direction !== 'DOWN') {
            direction = 'UP';
        } else if (yDiff < 0 && direction !== 'UP') {
            direction = 'DOWN';
        }
    }

    xDown = null;
    yDown = null;
}





// Função para desenhar a cobrinha
function drawSnake() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.drawImage(imgCabeca, segment.x, segment.y, gridSize, gridSize);
        } else {
            ctx.drawImage(imgCorpo, segment.x, segment.y, gridSize, gridSize);
        }
    });



}


// Função para atualizar a pontuação máxima
function updateMaxScoreDisplay() {
    const maxScoreElement = document.getElementById("maxScore");
    maxScoreElement.innerText = ` ${maxScore}`;
}

// Quando o jogador comer uma maçã, vamos verificar se a pontuação atual é maior
function updateScore(newScore) {
    // Verifica se a nova pontuação é maior que a armazenada
    if (newScore > maxScore) {
        maxScore = newScore;

        updateMaxScoreDisplay();  // Atualiza a exibição da pontuação
    }
}

// Exemplo de uso: ao comer uma maçã (essa lógica pode ser inserida na parte do código onde a pontuação é incrementada)
let currentScore = 0;
// Supondo que sempre que uma maçã é comida, o score aumenta
function eatApple() {
    currentScore++;
    updateScore(currentScore);  // Atualiza a pontuação, se necessário
}

// Atualiza a pontuação máxima ao carregar a página
window.onload = function () {
    // Atualizar o valor de maxScore do localStorage e a exibição inicial
    maxScore = localStorage.getItem("maxScore") ? parseInt(localStorage.getItem("maxScore")) : 0;
    updateMaxScoreDisplay();
};


// Função para mover a cobrinha
function moveSnake() {
    let head = { ...snake[0] };

    switch (direction) {
        case 'UP': head.y -= gridSize; break;
        case 'DOWN': head.y += gridSize; break;
        case 'LEFT': head.x -= gridSize; break;
        case 'RIGHT': head.x += gridSize; break;
    }

    // Verifica colisão com as bordas antes de parar o jogo
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        somBater.play(); // Toca o som ANTES de definir gameOver
        setTimeout(() => { gameOver = true; }, 100); // Pequeno delay para o som tocar
        return;
    }

    snake.unshift(head);
    snake.pop();
}


// Função para verificar colisões
function checkCollision() {
    const head = snake[0];

    // Colisão com as bordas (parede)
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        somBater.play(); // Toca o som antes de finalizar o jogo
        setTimeout(() => { gameOver = true; }, 50); // Pequeno delay para dar tempo ao som
        return;
    }

    // Colisão com o próprio corpo
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            somBater.play();
            gameOver = true;
            return;
        }
    }
}




// Função para gerar a comida aleatoriamente
function generateFood() {
    food.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
}

// Função para desenhar a comida no canvas
function drawFood() {
    ctx.drawImage(imgComida, food.x, food.y, gridSize, gridSize);
}

// Chame esta função sempre que a comida for comida
function checkFoodCollision() {
    const head = snake[0];
    if (head.x === food.x && head.y === food.y) {
        somComer.play(); // Toca o som ao comer
        snake.push({ x: food.x, y: food.y }); // Aumenta a cobrinha
        foodEaten++; // Incrementa o contador de comidas
        generateFood(); // Gera nova comida

        // Atualizar a pontuação
        updateScore(foodEaten);  // A cada comida, incrementa o contador e verifica a pontuação máxima


    }
}

// Função para controlar o movimento da cobrinha com as setas ou W, A, S, D
function changeDirection(event) {
    if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
        if (direction !== 'DOWN') direction = 'UP';
    } else if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
        if (direction !== 'UP') direction = 'DOWN';
    } else if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        if (direction !== 'RIGHT') direction = 'LEFT';
    } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        if (direction !== 'LEFT') direction = 'RIGHT';
    }
}

// Função para reiniciar o jogo
function restartGame() {
    snake = [
        { x: 160, y: 160 },
        { x: 140, y: 160 }
    ];
    direction = 'RIGHT';
    gameOver = false;
    foodEaten = 0; // Resetar o contador de comidas
    speed = 150; // Resetar a velocidade para o valor inicial
    generateFood();
    drawSnake();
    drawFood();
    document.addEventListener("keydown", changeDirection);
    gameStarted = false; // Garantir que o jogo está pronto para começar
}

// Função para iniciar o movimento quando pressionado espaço ou play
function startGameOnSpaceOrPlay(event) {
    if ((event.key === " " || event.type === "click") && !gameStarted) {
        gameStarted = true;
        updateGame();
    }
}

function updateGame() {
    if (gameStarted) {
        moveSnake();
        checkCollision(); // O som agora é tocado aqui dentro, diretamente
        checkFoodCollision();
        drawSnake();
        drawFood();
    }

    if (!gameOver && gameStarted) {
        setTimeout(updateGame, speed);
    }
}


// Função para atualizar o contador de maçãs fora do canvas
function updateFoodCount() {
    const foodCount = document.getElementById('foodCount');
    foodCount.textContent = ` ${foodEaten}`;
}

// Chame essa função para atualizar o contador fora do canvas
setInterval(updateFoodCount, 100);

// Configurar eventos de teclado para movimentação
document.addEventListener("keydown", event => {
    if (!gameOver) {
        changeDirection(event);
    }
});

// Configurar evento de clique no botão "Play" para reiniciar o jogo
document.getElementById("playButton").addEventListener("click", () => {
    restartGame();
    gameStarted = true; // Iniciar o jogo ao clicar no Play
    updateGame(); // Iniciar o loop do jogo
});

// Iniciar o jogo gerando a primeira comida
generateFood();

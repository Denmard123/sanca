document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const container = document.getElementById("game-container") || document.body;

    const GRID_SIZE = 24;
    let box;
    let snake = [];
    let direction = "RIGHT";
    let nextDirection = "RIGHT"; // Untuk menghindari perubahan ganda
    let score = 0;
    let highScore = parseInt(localStorage.getItem("highScore")) || 0;
    let gameInterval;
    let gameRunning = false;

    const adsLinksOriginal = [
        "https://otieu.com/4/9979613",
        "https://otieu.com/4/6159302",
        "https://otieu.com/4/6159925",
        "https://otieu.com/4/8177061"
    ];
    const linkColors = ["#F33", "#F90", "#3CF", "#9F3"];

    const foodItems = [];
    for (let i = 0; i < 500; i++) {
        const index = i % adsLinksOriginal.length;
        foodItems.push({
            link: adsLinksOriginal[index],
            color: linkColors[index]
        });
    }
    let currentFoodIndex = 0;

    const overlay = document.getElementById("overlay");
    let overlayShown = false;

    const scoreEl = document.getElementById("score");
    const highScoreEl = document.getElementById("highScore");
    highScoreEl.innerText = highScore;

    const gameOverOverlay = document.getElementById("gameOverOverlay");

    const toastContainer = document.getElementById("toastContainer");
    const toastMessages = [
        "🎉 Mantap! Kamu dapat 10 poin!",
        "🔥 Hebat! Snake kamu lagi on fire!",
        "💚 Keep going! 10 poin tercapai!",
        "🌟 Luar biasa! Snake makin panjang!"
    ];

    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "bg-green-600 text-black px-4 py-2 rounded shadow-lg animate-fadeinout";
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }

    function resizeCanvas() {
        const size = Math.min(container.clientWidth || window.innerWidth, window.innerHeight * 0.7);
        canvas.width = size;
        canvas.height = size;
        box = Math.floor(size / GRID_SIZE) || 1;
        if (snake.length === 0) snake = [{ x: Math.floor(GRID_SIZE/2), y: Math.floor(GRID_SIZE/2) }];
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    function spawnFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
                ...foodItems[currentFoodIndex]
            };
        } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
        currentFoodIndex = (currentFoodIndex + 1) % foodItems.length;
        return newFood;
    }
    let food = spawnFood();

    // Controls keyboard
    document.addEventListener("keydown", e => {
        if (!gameRunning) return;
        if (e.key === "ArrowLeft" && direction !== "RIGHT") nextDirection = "LEFT";
        if (e.key === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
        if (e.key === "ArrowRight" && direction !== "LEFT") nextDirection = "RIGHT";
        if (e.key === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
        if(!gameRunning) startGame();
    });

    // Joystick
    const joystickContainer = document.getElementById("joystickContainer");
    const joystickInner = document.getElementById("joystickInner");
    let joystickActive = false;
    let startX = 0, startY = 0;

    joystickInner.addEventListener("pointerdown", e => {
        joystickActive = true;
        startX = e.clientX;
        startY = e.clientY;
        joystickInner.setPointerCapture(e.pointerId);
    });

    joystickInner.addEventListener("pointermove", e => {
        if(!joystickActive) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        // Batasi jarak knob maksimal setengah container
        const maxDist = joystickContainer.offsetWidth / 2 - joystickInner.offsetWidth / 2;
        const distance = Math.min(Math.hypot(dx, dy), maxDist);
        const angle = Math.atan2(dy, dx);

        joystickInner.style.transform = `translate(${distance * Math.cos(angle)}px, ${distance * Math.sin(angle)}px)`;

        // Tentukan arah berdasarkan 45°
        if(Math.abs(dx) > Math.abs(dy)){
            if(dx>0 && direction!=="LEFT") nextDirection="RIGHT";
            else if(dx<0 && direction!=="RIGHT") nextDirection="LEFT";
        } else {
            if(dy>0 && direction!=="UP") nextDirection="DOWN";
            else if(dy<0 && direction!=="DOWN") nextDirection="UP";
        }

        if(!gameRunning) startGame();
    });

    joystickInner.addEventListener("pointerup", e => {
        joystickActive = false;
        joystickInner.style.transform = "translate(0px,0px)";
    });

    joystickInner.addEventListener("pointercancel", e => {
        joystickActive = false;
        joystickInner.style.transform = "translate(0px,0px)";
    });

    // start button
    document.getElementById("startBtn")?.addEventListener("click", () => {
        overlay.classList.add("hidden");
        overlayShown = true;
        gameRunning = true;
        startGame();
    });

    // restart button
    document.getElementById("restartBtn").addEventListener("click", () => {
        gameOverOverlay.classList.add("hidden");
        resetGame(false);
        startGame();
    });

    document.addEventListener("visibilitychange", () => {
        if(document.hidden){
            if(gameInterval) clearInterval(gameInterval);
            gameRunning = false;
        }
    });

    function draw() {
        if(!gameRunning) return;
        direction = nextDirection; // update direction

        ctx.fillStyle = "#000";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        for(let i=0;i<snake.length;i++){
            ctx.fillStyle = i===0?"#0F8":"#088";
            ctx.fillRect(snake[i].x*box,snake[i].y*box,box,box);
        }

        ctx.fillStyle = food.color;
        ctx.fillRect(food.x*box,food.y*box,box,box);

        let headX = snake[0].x, headY = snake[0].y;
        if(direction==="LEFT") headX--;
        if(direction==="RIGHT") headX++;
        if(direction==="UP") headY--;
        if(direction==="DOWN") headY++;

        if(headX===food.x && headY===food.y){
            score++;
            scoreEl.innerText = score;

            if(score > highScore){
                highScore = score;
                highScoreEl.innerText = highScore;
                localStorage.setItem("highScore", highScore);
            }

            // setiap 10 poin
            if(score % 10 === 0){
                const randomIndex = Math.floor(Math.random()*adsLinksOriginal.length);
                const adLink = adsLinksOriginal[randomIndex];
                try{
                    window.open(adLink, "_blank"); // buka tab baru
                }catch{}

                gameRunning = false;
                showToast(toastMessages[Math.floor(Math.random()*toastMessages.length)]);
            }

            if(score === 100){
                endGame(true);
                return;
            }

            food = spawnFood();
        } else {
            snake.pop();
        }

        const newHead = {x: headX, y: headY};
        if(headX<0||headY<0||headX>=GRID_SIZE||headY>=GRID_SIZE||
           snake.some(seg=>seg.x===newHead.x&&seg.y===newHead.y)){
            clearInterval(gameInterval);
            gameRunning=false;
            gameOverOverlay.classList.remove("hidden");
            document.getElementById("finalScore").innerText = `Skor kamu: ${score} | High Score: ${highScore}`;
            return;
        }

        snake.unshift(newHead);
    }

    function startGame(){
        if(gameInterval) clearInterval(gameInterval);
        if(snake.length===0) snake=[{x:Math.floor(GRID_SIZE/2),y:Math.floor(GRID_SIZE/2)}];
        gameRunning=true;
        gameInterval=setInterval(draw,100);
    }

    function resetGame(showOverlay=true){
        snake=[{x:Math.floor(GRID_SIZE/2),y:Math.floor(GRID_SIZE/2)}];
        direction="RIGHT";
        nextDirection="RIGHT";
        score=0;
        scoreEl.innerText = score;
        currentFoodIndex=0;
        food=spawnFood();
        gameRunning=false;

        if(showOverlay && !overlayShown){
            overlay.classList.remove("hidden");
        }
    }

    function endGame(isEndGame=false){
        clearInterval(gameInterval);
        gameRunning=false;

        if(score>highScore){
            highScore = score;
            highScoreEl.innerText = highScore;
            localStorage.setItem("highScore", highScore);
        }

        if(isEndGame){
            alert(`🏁 Selamat! Kamu berhasil makan 100 titik! Skor akhir: ${score} | High Score: ${highScore}`);
        } else {
            gameOverOverlay.classList.remove("hidden");
            document.getElementById("finalScore").innerText=`Skor kamu: ${score} | High Score: ${highScore}`;
        }
    }
});

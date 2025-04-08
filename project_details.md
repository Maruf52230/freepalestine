Awesome! Here's a ready-to-use `README.md` guide for building your **Fruit Cutter Game** using HTML, CSS, and JavaScript. It's written step-by-step so you can follow it inside **Cursor AI** or any IDE.

```markdown
# 🍉 Fruit Cutter Game - Build Guide

This guide will walk you through building a **Fruit Cutter Game** (like Fruit Ninja) using HTML5 Canvas, CSS, and JavaScript.

---

## 📁 Folder Structure

```
fruit-cutter-game/
├── index.html
├── style.css
├── script.js
├── README.md
└── images/
    ├── apple.png
    ├── apple_half1.png
    ├── apple_half2.png
    ├── pineapple.png
    ├── orange.png
    ├── watermelon.png
    other fruit half images is also there.
    ├── bomb.png (optional)
    ├── splash_red.png
    ├── background.jpg
    ├── knife.png
    └── heart.png (for lives)
```

---

## 🧱 Step-by-Step Directions

### 1. **Setup the HTML**

Create a `<canvas>` element inside `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fruit Cutter Game</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <canvas id="gameCanvas" width="800" height="600"></canvas>
  <script src="script.js"></script>
</body>
</html>
```

---

### 2. **Style the Page**

In `style.css`, make the canvas full-screen and set the background:

```css
body {
  margin: 0;
  overflow: hidden;
}

canvas {
  display: block;
  background: url('./images/background.jpg') no-repeat center center;
  background-size: cover;
}
```

---

### 3. **Initialize Game Canvas**

In `script.js`, initialize the canvas and load assets:

```js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let fruits = [];
let knife = { x: 0, y: 0 };
let score = 0;
let lives = 3;

const knifeImg = new Image();
knifeImg.src = 'images/knife.png';

// Load fruit images similarly and push them into an array

canvas.addEventListener("mousemove", (e) => {
  knife.x = e.offsetX;
  knife.y = e.offsetY;
});
```

---

### 4. **Create Fruit Objects**

Each fruit should have:
- Position
- Velocity
- Type (to choose image)
- Sliced (true/false)

Add logic to spawn fruits randomly and update them using `requestAnimationFrame`.

---

### 5. **Detect Collision (Slice Logic)**

Check if the knife overlaps a fruit. If yes:
- Replace it with sliced halves
- Show a splash
- Play sound (optional)
- Increase score

```js
function detectCollision(fruit, knifeX, knifeY) {
  const dx = fruit.x - knifeX;
  const dy = fruit.y - knifeY;
  return Math.sqrt(dx*dx + dy*dy) < fruit.radius;
}
```

---

### 6. **Draw Knife**

```js
function drawKnife() {
  ctx.drawImage(knifeImg, knife.x - 25, knife.y - 25, 50, 50);
}
```

---

### 7. **Add Splash Effect**

Show a splash at the sliced fruit's position using a colored splash image (`splash_red.png`, etc).

---

### 8. **Score and Lives**

Add simple UI:
- Draw text for score
- Draw heart icons for lives
- If a fruit falls uncut: decrease a life

```js
ctx.fillStyle = "#fff";
ctx.font = "24px Arial";
ctx.fillText(`Score: ${score}`, 20, 30);
```

---

### 9. **Game Over Logic**

If lives == 0:
- Stop the game loop
- Show "Game Over" message
- Add Restart button

---

### 🔄 Game Loop Skeleton

```js
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw fruits
  // Detect slice
  // Draw knife
  // Draw score and lives

  requestAnimationFrame(update);
}

update();
```

---

## ✅ Tips

- Use `setInterval` to spawn new fruits every few seconds
- Randomize fruit type, position, and speed
- Add bombs for challenge (lose a life if sliced)


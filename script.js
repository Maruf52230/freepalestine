// Canvas setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game state
let score = 0;
let lives = 7;
let gameOver = false;
let fruits = [];
let knife = { x: 0, y: 0, trail: [] };
let lastFrameTime = 0;
let fruitSpawnTimer = 0;
const fruitSpawnInterval = 1800; // Adjusted from 2000ms to 1800ms due to reduced bomb rate
let gameStarted = true; // Changed to true to start game immediately
let isMobile = false;
let soundEnabled = true;
let isPortrait = false;

// Size adjustments for mobile
const FRUIT_SIZE_MULTIPLIER = 0.75; // Changed to 75% of original size
const KNIFE_SIZE_MULTIPLIER = 0.75; // Changed to 75% of original size

// DOM elements
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const gameOverElement = document.getElementById("game-over");
const finalScoreElement = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const soundToggleElement = document.getElementById("sound-toggle");
const soundIcon = soundToggleElement.querySelector("i");
const orientationMessage = document.getElementById("orientation-message");

// Load sounds
const cuttingSoundElement = document.getElementById("cutting-sound");

// Fullscreen button
const fullscreenBtn = document.createElement('button');
fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
fullscreenBtn.id = 'fullscreen-btn';
fullscreenBtn.className = 'hud-element';
document.getElementById('game-container').appendChild(fullscreenBtn);

// Fullscreen functions
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Update fullscreen button icon
function updateFullscreenIcon() {
  const icon = fullscreenBtn.querySelector('i');
  if (document.fullscreenElement) {
    icon.classList.remove('fa-expand');
    icon.classList.add('fa-compress');
  } else {
    icon.classList.remove('fa-compress');
    icon.classList.add('fa-expand');
  }
}

// Add fullscreen event listeners
document.addEventListener('fullscreenchange', updateFullscreenIcon);
fullscreenBtn.addEventListener('click', toggleFullscreen);

// Initialize sound based on localStorage preference if available
if (localStorage.getItem('fruitCutterSoundEnabled') === 'false') {
  soundEnabled = false;
  soundIcon.classList.remove('fa-volume-up');
  soundIcon.classList.add('fa-volume-mute');
}

// Check device orientation
function checkOrientation() {
  isPortrait = window.innerHeight > window.innerWidth;
  if (isMobile && isPortrait) {
    orientationMessage.classList.remove('hidden');
    if (gameStarted) {
      // Pause game if it was running
      gameStarted = false;
    }
  } else {
    orientationMessage.classList.add('hidden');
  }
}

// Toggle sound on/off
function toggleSound() {
  soundEnabled = !soundEnabled;
  
  // Update icon
  if (soundEnabled) {
    soundIcon.classList.remove('fa-volume-mute');
    soundIcon.classList.add('fa-volume-up');
  } else {
    soundIcon.classList.remove('fa-volume-up');
    soundIcon.classList.add('fa-volume-mute');
  }
  
  // Save preference to localStorage
  localStorage.setItem('fruitCutterSoundEnabled', soundEnabled);
}

// Add sound toggle event listener
soundToggleElement.addEventListener('click', toggleSound);
soundToggleElement.addEventListener('touchend', function(e) {
  e.preventDefault();
  toggleSound();
}, { passive: false });

// Function to play sound with different rates for different fruit types
function playSound(pitch = 1.0) {
  if (!soundEnabled) return;
  
  try {
    // Create a new audio context on each sound play
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a source node from the audio element
    const source = audioContext.createMediaElementSource(cuttingSoundElement.cloneNode());
    
    // Create a gain node to control volume
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.8; // Set volume to 80%
    
    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Adjust playback rate for pitch
    source.playbackRate.value = pitch;
    
    // Play the sound
    source.mediaElement.play().catch(error => {
      console.error("Error playing cutting sound:", error);
      
      // Fallback method if the advanced audio method fails
      fallbackPlaySound(pitch);
    });
  } catch (error) {
    console.error("Error setting up audio:", error);
    
    // Use fallback method
    fallbackPlaySound(pitch);
  }
}

// Fallback method for playing sound
function fallbackPlaySound(pitch) {
  try {
    // Clone the audio element for simultaneous sounds
    const soundClone = cuttingSoundElement.cloneNode();
    
    // Set the playback rate for pitch adjustment
    soundClone.playbackRate = pitch;
    
    // Play the sound
    const playPromise = soundClone.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error("Fallback play error:", error);
        
        // Last resort - just try to play the original element
        if (soundEnabled) {
          cuttingSoundElement.currentTime = 0;
          cuttingSoundElement.play().catch(() => {});
        }
      });
    }
  } catch (error) {
    console.error("Fallback sound error:", error);
  }
}

// Check if device is mobile
function checkMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// Set initial mobile state
isMobile = checkMobile();
checkOrientation();

// Load images
const fruitImages = {
  apple: {
    whole: loadImage('images/apple.png'),
    half1: loadImage('images/apple_half_1.png'),
    half2: loadImage('images/apple_half_2.png')
  },
  orange: {
    whole: loadImage('images/orange.png'),
    half1: loadImage('images/orange_half_1.png'),
    half2: loadImage('images/orange_half_2.png')
  },
  watermelon: {
    whole: loadImage('images/watermalon.png'),
    half1: loadImage('images/watermalon_half_1.png'),
    half2: loadImage('images/watermalon_half_2.png')
  },
  pineapple: {
    whole: loadImage('images/pineapple.png'),
    half1: loadImage('images/pineapple_half_1.png'),
    half2: loadImage('images/pineapple_half_2.png')
  },
  coconut: {
    whole: loadImage('images/coconut.png'),
    half1: loadImage('images/coconut_half_1.png'),
    half2: loadImage('images/coconut_half_2.png')
  }
};

const bombImage = loadImage('images/bomb.png');
const splashImage = loadImage('images/splash.png');
const knifeImage = loadImage('images/knife.png');
const heartImage = loadImage('images/heart.png');

// Helper function to load images
function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

// Initialize lives display
function initializeLives() {
  livesElement.innerHTML = '';
  for (let i = 0; i < lives; i++) {
    const heart = document.createElement('img');
    heart.src = 'images/heart.png';
    heart.classList.add('heart');
    livesElement.appendChild(heart);
  }
}

// Update lives display
function updateLives() {
  while (livesElement.firstChild) {
    livesElement.removeChild(livesElement.firstChild);
  }
  for (let i = 0; i < lives; i++) {
    const heart = document.createElement('img');
    heart.src = 'images/heart.png';
    heart.classList.add('heart');
    livesElement.appendChild(heart);
  }
}

// Fruit class
class Fruit {
  constructor(type) {
    this.type = type;
    this.isBomb = type === 'bomb';
    this.width = this.isBomb ? 60 * FRUIT_SIZE_MULTIPLIER : 80 * FRUIT_SIZE_MULTIPLIER; // Reduced to 60% of original size
    this.height = this.isBomb ? 60 * FRUIT_SIZE_MULTIPLIER : 80 * FRUIT_SIZE_MULTIPLIER; // Reduced to 60% of original size
    this.x = Math.random() * (canvas.width - this.width);
    this.y = canvas.height + this.height;
    this.velocityX = (Math.random() - 0.5) * 4;
    this.velocityY = -15 - Math.random() * 5;
    this.gravity = 0.5;
    this.rotation = 0;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    this.sliced = false;
    this.removeTimer = 0;
    this.splashTimer = 0;
    this.splashX = 0;
    this.splashY = 0;
    
    // Add warning effect for bombs
    this.warningAlpha = this.isBomb ? 1 : 0;
    
    // Properties for sliced halves
    this.half1 = {
      x: 0,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      rotation: 0,
      rotationSpeed: 0
    };
    
    this.half2 = {
      x: 0,
      y: 0,
      velocityX: 0,
      velocityY: 0,
      rotation: 0,
      rotationSpeed: 0
    };
    
    // Set radius for collision detection
    this.radius = this.width / 2;
    
    // Adjust coconut properties if needed
    if (this.type === 'coconut') {
      // Coconut has higher velocity (harder to cut)
      this.velocityY = -20 - Math.random() * 5;
      // Coconut gives more points when cut
      this.pointValue = 20;
    } else {
      this.pointValue = 10;
    }
  }

  update(deltaTime) {
    if (this.sliced) {
      this.removeTimer += deltaTime;
      this.splashTimer += deltaTime;
      
      if (!this.isBomb) {
        // Update first half physics
        this.half1.velocityY += this.gravity;
        this.half1.x += this.half1.velocityX;
        this.half1.y += this.half1.velocityY;
        this.half1.rotation += this.half1.rotationSpeed;
        
        // Update second half physics
        this.half2.velocityY += this.gravity;
        this.half2.x += this.half2.velocityX;
        this.half2.y += this.half2.velocityY;
        this.half2.rotation += this.half2.rotationSpeed;
        
        // Bounce off walls for halves
        if (this.half1.x < 0 || this.half1.x > canvas.width - this.width/2) {
          this.half1.velocityX *= -0.7;
        }
        
        if (this.half2.x < 0 || this.half2.x > canvas.width - this.width/2) {
          this.half2.velocityX *= -0.7;
        }
      }
      
      return this.removeTimer > 2000 || 
             (this.half1.y > canvas.height + this.height && 
              this.half2.y > canvas.height + this.height); // Return true when the fruit should be removed
    }

    // Update warning alpha for bombs (pulsing effect)
    if (this.isBomb) {
      this.warningAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
    }

    this.velocityY += this.gravity;
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.rotation += this.rotationSpeed;

    // Bounce off walls
    if (this.x < 0 || this.x > canvas.width - this.width) {
      this.velocityX *= -0.8;
    }

    // Return true if the fruit is out of bounds (player missed it)
    return this.y > canvas.height + this.height && !this.sliced;
  }

  draw() {
    if (!this.sliced) {
      // Draw whole fruit
      ctx.save();
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.rotation);
      
      // Draw the bomb with warning effect
      if (this.isBomb) {
        // Draw warning glow
        const warningRadius = this.radius * 1.3;
        ctx.beginPath();
        ctx.arc(0, 0, warningRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 50, 50, ${this.warningAlpha * 0.3})`;
        ctx.fill();
      }
      
      const image = this.isBomb ? bombImage : fruitImages[this.type].whole;
      ctx.drawImage(image, -this.width / 2, -this.height / 2, this.width, this.height);
      ctx.restore();
    } else {
      // Draw sliced fruit halves with independent physics
      if (!this.isBomb) {
        // Left half
        ctx.save();
        ctx.translate(this.half1.x, this.half1.y);
        ctx.rotate(this.half1.rotation);
        ctx.drawImage(
          fruitImages[this.type].half1,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
        ctx.restore();
        
        // Right half
        ctx.save();
        ctx.translate(this.half2.x, this.half2.y);
        ctx.rotate(this.half2.rotation);
        ctx.drawImage(
          fruitImages[this.type].half2,
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
        ctx.restore();
      }

      // Draw splash if within time window
      if (this.splashTimer < 300) {
        ctx.save();
        ctx.translate(this.splashX, this.splashY);
        const splashSize = 80 * FRUIT_SIZE_MULTIPLIER; // Reduced to 60% of original size
        ctx.globalAlpha = 1 - this.splashTimer / 300;
        ctx.drawImage(
          splashImage, 
          -splashSize / 2, 
          -splashSize / 2, 
          splashSize, 
          splashSize
        );
        ctx.globalAlpha = 1;
        ctx.restore();
      }
    }
  }
}

// Update knife position
function updateKnifePosition(x, y) {
  // Only start the game if in landscape or on desktop
  if (isMobile && isPortrait) {
    return;
  }
  
  // Adjust position for mobile touch
  if (isMobile) {
    const rect = canvas.getBoundingClientRect();
    x = x - rect.left;
    y = y - rect.top;
  }

  knife.x = x;
  knife.y = y;
  
  // Add current position to trail
  knife.trail.push({ x: knife.x, y: knife.y });
  
  // Keep trail at a reasonable length
  if (knife.trail.length > 5) {
    knife.trail.shift();
  }
}

// Knife movement for mouse
function handleMouseMove(e) {
  updateKnifePosition(e.clientX, e.clientY);
}

// Handle touch movement
function handleTouchMove(e) {
  e.preventDefault(); // Prevent scrolling
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    updateKnifePosition(touch.clientX, touch.clientY);
  }
}

// Handle touch start
function handleTouchStart(e) {
  e.preventDefault(); // Prevent scrolling
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    updateKnifePosition(touch.clientX, touch.clientY);
  }
}

// Add event listeners
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
restartBtn.addEventListener("click", restartGame);
restartBtn.addEventListener("touchend", function(e) {
  e.preventDefault();
  restartGame();
}, { passive: false });

// Initialize game
function init() {
  score = 0;
  lives = 7;
  gameOver = false;
  fruits = [];
  knife.trail = [];
  fruitSpawnTimer = 0;
  gameStarted = true;
  
  scoreElement.textContent = `Score: ${score}`;
  gameOverElement.classList.add('hidden');
  
  // Check if device is mobile
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check orientation
  checkOrientation();
  
  // Ensure canvas is properly sized
  resizeCanvas();
  
  initializeLives();
  
  // Start game loop
  requestAnimationFrame(gameLoop);
}

// Game loop
function gameLoop(timestamp) {
  if (gameOver) return;
  
  // Skip game logic if in portrait mode on mobile
  if (isMobile && isPortrait) {
    requestAnimationFrame(gameLoop);
    return;
  }
  
  // Calculate delta time
  const deltaTime = timestamp - lastFrameTime || 0;
  lastFrameTime = timestamp;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Only spawn fruits if game is started
  if (gameStarted) {
    // Spawn fruits
    fruitSpawnTimer += deltaTime;
    if (fruitSpawnTimer >= fruitSpawnInterval) {
      spawnFruit();
      fruitSpawnTimer = 0;
    }
  }
  
  // Update and draw fruits
  for (let i = fruits.length - 1; i >= 0; i--) {
    const fruit = fruits[i];
    const shouldRemove = fruit.update(deltaTime);
    
    // If fruit is out of bounds and not sliced, remove it and decrease lives
    if (shouldRemove) {
      if (!fruit.sliced && !fruit.isBomb) {
        lives--;
        updateLives();
        if (lives <= 0) {
          endGame();
        }
      }
      fruits.splice(i, 1);
    } else {
      // Draw the fruit
      fruit.draw();
      
      // Check for collision with knife
      if (!fruit.sliced && detectCollision(fruit, knife)) {
        sliceFruit(fruit);
      }
    }
  }
  
  // Draw knife
  drawKnife();
  
  // Continue game loop
  requestAnimationFrame(gameLoop);
}

// Spawn a new fruit
function spawnFruit() {
  const types = ['apple', 'orange', 'watermelon', 'pineapple', 'coconut'];
  
  // Adjust fruit count based on device (fewer on mobile)
  const maxFruits = isMobile ? 1 : 2;
  const fruitCount = Math.floor(Math.random() * maxFruits) + 1;
  
  for (let i = 0; i < fruitCount; i++) {
    // Add a bomb with 25% probability (reduced from 40%)
    if (Math.random() < 0.25) {
      fruits.push(new Fruit('bomb'));
    } else {
      // 75% chance for a fruit
      const randomType = types[Math.floor(Math.random() * types.length)];
      fruits.push(new Fruit(randomType));
    }
  }
}

// Detect collision between knife and fruit
function detectCollision(fruit, knife) {
  // Check current knife position
  const dx = fruit.x + fruit.width / 2 - knife.x;
  const dy = fruit.y + fruit.height / 2 - knife.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < fruit.radius) {
    return true;
  }
  
  // Check knife trail for more accurate slicing
  for (let i = 1; i < knife.trail.length; i++) {
    const p1 = knife.trail[i - 1];
    const p2 = knife.trail[i];
    
    const lineDistToFruit = linePointDistance(
      p1.x, p1.y, 
      p2.x, p2.y, 
      fruit.x + fruit.width / 2, fruit.y + fruit.height / 2
    );
    
    if (lineDistToFruit < fruit.radius) {
      return true;
    }
  }
  
  return false;
}

// Helper function to find distance from line to point
function linePointDistance(x1, y1, x2, y2, px, py) {
  const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  if (lineLength === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  
  const t = Math.max(0, Math.min(1, ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / (lineLength ** 2)));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

// Slice a fruit
function sliceFruit(fruit) {
  fruit.sliced = true;
  
  // Play cutting sound with pitch variation based on fruit type
  if (!fruit.isBomb) {
    let pitchValue = 1.0;
    
    // Different pitch for each fruit type
    switch(fruit.type) {
      case 'apple':
        pitchValue = 1.2; // Higher pitch
        break;
      case 'orange':
        pitchValue = 1.0; // Normal pitch
        break;
      case 'watermelon':
        pitchValue = 0.7; // Lower pitch
        break;
      case 'pineapple':
        pitchValue = 0.9; // Slightly lower pitch
        break;
      case 'coconut':
        pitchValue = 0.6; // Very low pitch for hard coconut
        break;
    }
    
    playSound(pitchValue);
  } else {
    // Different sound for bomb (using the same sound but with a very low pitch)
    playSound(0.5);
  }
  
  // Calculate velocity direction based on knife movement
  let knifeDirection = { x: 0, y: 0 };
  if (knife.trail.length >= 2) {
    const lastPoint = knife.trail[knife.trail.length - 1];
    const prevPoint = knife.trail[knife.trail.length - 2];
    knifeDirection.x = lastPoint.x - prevPoint.x;
    knifeDirection.y = lastPoint.y - prevPoint.y;
    
    // Normalize direction
    const magnitude = Math.sqrt(knifeDirection.x * knifeDirection.x + knifeDirection.y * knifeDirection.y);
    if (magnitude > 0) {
      knifeDirection.x /= magnitude;
      knifeDirection.y /= magnitude;
    }
  }
  
  // Set splash position
  fruit.splashX = fruit.x + fruit.width / 2;
  fruit.splashY = fruit.y + fruit.height / 2;
  
  if (!fruit.isBomb) {
    // Initialize the position of both halves to the current fruit position
    fruit.half1.x = fruit.x + fruit.width / 2;
    fruit.half1.y = fruit.y + fruit.height / 2;
    fruit.half2.x = fruit.x + fruit.width / 2;
    fruit.half2.y = fruit.y + fruit.height / 2;
    
    // Set different velocities for each half based on knife direction
    const baseSpeed = 6;
    const speedVariation = 2;
    
    // First half goes one way
    fruit.half1.velocityX = fruit.velocityX * 0.5 - knifeDirection.y * (baseSpeed + Math.random() * speedVariation);
    fruit.half1.velocityY = fruit.velocityY * 0.5 + knifeDirection.x * (baseSpeed + Math.random() * speedVariation);
    fruit.half1.rotationSpeed = (Math.random() - 0.5) * 0.15;
    fruit.half1.rotation = fruit.rotation;
    
    // Second half goes the opposite way
    fruit.half2.velocityX = fruit.velocityX * 0.5 + knifeDirection.y * (baseSpeed + Math.random() * speedVariation);
    fruit.half2.velocityY = fruit.velocityY * 0.5 - knifeDirection.x * (baseSpeed + Math.random() * speedVariation);
    fruit.half2.rotationSpeed = (Math.random() - 0.5) * 0.15;
    fruit.half2.rotation = fruit.rotation;
  }
  
  // If it's a bomb, decrease lives
  if (fruit.isBomb) {
    lives--;
    updateLives();
    if (lives <= 0) {
      endGame();
    }
  } else {
    // Increase score
    score += fruit.pointValue;
    scoreElement.textContent = `Score: ${score}`;
  }
}

// Draw knife
function drawKnife() {
  const knifeSize = isMobile ? 60 * KNIFE_SIZE_MULTIPLIER : 60;
  ctx.drawImage(
    knifeImage,
    knife.x - knifeSize / 2,
    knife.y - knifeSize / 2,
    knifeSize,
    knifeSize
  );
}

// End game
function endGame() {
  gameOver = true;
  finalScoreElement.textContent = score;
  gameOverElement.classList.remove('hidden');
}

// Restart game
function restartGame() {
  init();
}

// Handle window resize
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Adjust HUD elements for mobile
  if (isMobile) {
    scoreElement.style.fontSize = '16px';
    livesElement.style.fontSize = '16px';
    soundToggleElement.style.width = '30px';
    soundToggleElement.style.height = '30px';
  }
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', function() {
  setTimeout(resizeCanvas, 100);
});

// Start the game
init(); 
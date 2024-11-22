const myImage = new Image();
myImage.src = "../rainUmbrella.jpg";

myImage.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1000;
  canvas.height = 1000;
  ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let particlesArray = [];
  const numberOfParticles = 5000;
  let mappedImage = [];

  for (let y = 0; y < canvas.height; y++) {
    let row = [];
    for (let x = 0; x < canvas.width; x++) {
      const red = pixels.data[y * 4 * canvas.width + x * 4];
      const green = pixels.data[y * 4 * canvas.width + (x * 4 + 1)];
      const blue = pixels.data[y * 4 * canvas.width + (x * 4 + 2)];
      const brightness = calculateRelativeBrightness(red, green, blue);
      row.push([brightness]);
    }
    mappedImage.push(row);
  }

  function calculateRelativeBrightness(red, green, blue) {
    return Math.sqrt(
      red * red * 0.299 + green * green * 0.587 + blue * blue * 0.114
    );
  }
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width + 1; // Случайная начальная позиция по x
      this.y = Math.random() * canvas.height + 1000; // Случайная начальная позиция по y
      this.velocity = Math.random() * 2 + 1; // Базовая скорость
      this.size = Math.random() * 1 + 1.1; // Размер капли
      this.speedModifier = 1; // Коэффициент влияния яркости
    }

    update() {
      const posY = Math.floor(this.y);
      const posX = Math.floor(this.x);

      // Проверяем, чтобы частица не выходила за границы массива
      if (
        posY >= 0 &&
        posY < canvas.height &&
        posX >= 0 &&
        posX < canvas.width
      ) {
        this.speedModifier = mappedImage[posY][posX][0] || 0; // Влияние яркости
      }

      // Движение вниз: базовая скорость + влияние яркости
      this.y += this.velocity + this.speedModifier * 0.05;

      // Если частица выходит за нижнюю границу, она сбрасывается наверх
      if (this.y > canvas.height) {
        this.y = 0;
        this.x = Math.random() * canvas.width; // Рандомный сброс по x
      }
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 1); // Рисуем круг
      ctx.fill();
    }
  }

  function init() {
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }
  init();

  function animate() {
    ctx.globalAlpha = 1;
    ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particlesArray.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
});

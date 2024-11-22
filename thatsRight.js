const myImage = new Image();
myImage.src = "../rainUmbrella.jpg";

myImage.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  ctx.drawImage(myImage, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let particlesArray = [];
  const numberOfParticles = 7000;
  let mappedImage = [];
  const mouse = { x: undefined, y: undefined, radius: 300 };
  const canvasPosition = canvas.getBoundingClientRect();

  canvas.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX - canvasPosition.left;
    mouse.y = e.clientY - canvasPosition.top;
  });

  // Обработчики мыши
  //   canvas.addEventListener("mousemove", (e) => {
  //     mouse.x = e.offsetX;
  //     mouse.y = e.offsetY;
  //     console.log(mouse);
  //   });

  canvas.addEventListener("mouseleave", () => {
    mouse.x = undefined;
    mouse.y = undefined;
  });

  // Построение карты яркости
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

  // Класс частиц
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.velocity = Math.random() * 2 + 1;
      this.size = Math.random() * 1 + 1.1;
      this.speedModifier = 1;
      this.angle = 0;
      this.amplitude = Math.random() * 20 + 2000; // Амплитуда волны
    }

    update() {
      const posY = Math.floor(this.y);
      const posX = Math.floor(this.x);

      if (
        posY >= 0 &&
        posY < canvas.height &&
        posX >= 0 &&
        posX < canvas.width
      ) {
        this.speedModifier = mappedImage[posY][posX][0] || 0;
      }

      // Движение вниз
      this.y += this.velocity + this.speedModifier * 0.05;

      // Волнообразное движение по X при приближении к мыши
      if (mouse.x && mouse.y) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y + 200;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
          const angle = Math.atan2(dy, dx);
          this.angle += 0.05;
          this.x +=
            (Math.sin(this.angle) *
              this.amplitude *
              (mouse.radius - distance)) /
            (mouse.radius * 0.5);
        }
      }

      // Сброс позиции
      if (this.y > canvas.height) {
        this.y = 0;
        this.x = Math.random() * canvas.width;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
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

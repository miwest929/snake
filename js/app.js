var GameManager = function(canvas_id) {
  this.canvas = document.getElementById(canvas_id);
  this.context = this.canvas.getContext('2d');
  this.objects = [];

  this.is_ready = function() {
    return (window.gameManager.context !== null);
  };

  this.process_next_frame = function() {
    if (window.gameManager.is_ready()) {
      window.gameManager.updateObjects();
      window.gameManager.checkCollisions();
      window.gameManager.renderNextFrame();
    }
  };

  this.updateObjects = function() {
    for (var index in window.gameManager.objects) {
      if (window.gameManager.objects[index].hasOwnProperty('update')) {
        window.gameManager.objects[index].update();
      }
    }
  }

  this.checkCollisions = function() {
    var snake = window.gameManager.objects[0];
    var pellet = window.gameManager.objects[1];

    if (Math.floor(snake.tileX) == pellet.tileX &&
        Math.floor(snake.tileY) == pellet.tileY) {
      snake.eatPellet(pellet);
    }

    if (snake.collidesWithSelf()) {
      alert("GAME OVER!!");
    }
  }

  this.renderNextFrame = function() {
    var context = window.gameManager.context;
    var canvas = window.gameManager.canvas;

    context.fillStyle = "rgb(0,0,0)";
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (var index in window.gameManager.objects) {
      window.gameManager.objects[index].draw(context);
    }

    var snake = window.gameManager.objects[0];
    context.font="30px Arial";
    context.fillStyle = "rgb(255, 255, 255)";
    context.fillText(snake.pelletsEaten, 10, 50);
  };

   this.triggerKey = function(triggerFnName) {
    for (var index in window.gameManager.objects) {
      if (window.gameManager.objects[index].hasOwnProperty(triggerFnName)) {
        window.gameManager.objects[index][triggerFnName]();
      }
    }
  }

  this.calculateFrameRate = function(fps) {
    if (fps === 0)
      return 0;

    return 1000 / fps;
  };

  window.setInterval(this.process_next_frame, this.calculateFrameRate(60));
};
window.gameManager = new GameManager("game");

var GameObject = function() {
  this.WHITE = "rgb(255, 255, 255)";
  this.BROWN = "rgb(139, 69, 19)";

  this.drawTile = function(context, x, y, color) {
    context.fillStyle = color;
    context.fillRect( Math.floor(x * 20), Math.floor(y * 20), 20, 20);
  }
}

var Snake = function() {
  this.unitsWidth = 800 / 20;
  this.unitsHeight = 600 / 20;
  this.tileX = Math.floor(Math.random() * this.unitsWidth);
  this.tileY = Math.floor(Math.random() * this.unitsHeight);

  this.length = 2;
  this.body = [];
  this.pelletsEaten = 0;

  this.speed = 0.2;
  this.velocityX = this.speed;
  this.velocityY = 0.0;

  this.update = function() {
    var currTileX = this.tileX;
    var currTileY = this.tileY;

    this.tileX = (this.tileX + this.velocityX) % this.unitsWidth;
    this.tileY = (this.tileY + this.velocityY) % this.unitsHeight;

    if (this.tileX < 0)
      this.tileX += this.unitsWidth;

    if (this.tileY < 0)
      this.tileY += this.unitsHeight;

    if (Math.floor(currTileX) != Math.floor(this.tileX) ||
        Math.floor(currTileY) != Math.floor(this.tileY)) {
      if (this.body.length + 1 > this.length) {
        this.body.shift();
      }
      this.body.push({"tileX": this.tileX, "tileY": this.tileY});
    }
  }

  this.triggerUpKey = function() {
    this.velocityX = 0.0;
    this.velocityY = -this.speed;
  }

  this.triggerDownKey = function() {
    this.velocityX = 0.0;
    this.velocityY = this.speed;
  }

  this.triggerLeftKey = function() {
    this.velocityX = -this.speed;
    this.velocityY = 0.0;
  }

  this.triggerRightKey = function() {
    this.velocityX = this.speed;
    this.velocityY = 0.0;
  }

  this.eatPellet = function(pellet) {
    this.pelletsEaten += 1;
    this.length += 1;
    pellet.respawn();
  }

  this.collidesWithSelf = function() {
    var headTileX = Math.floor(this.tileX);
    var headTileY = Math.floor(this.tileY);
  }

  this.draw = function(context) {
    var rgbWhite = function(white) {
      return "rgb("+whiteness+","+whiteness+","+whiteness+")";
    }

    this.drawTile(context, this.tileX, this.tileY, rgbWhite(whiteness));
    var whiteness = 255;
    for (bodySegmentIndex = this.body.length - 1; bodySegmentIndex >= 0; bodySegmentIndex--) {
      //whiteness -= 10;

      this.drawTile(
        context,
        this.body[bodySegmentIndex].tileX,
        this.body[bodySegmentIndex].tileY,
        rgbWhite(whiteness)
      );
    }
  }
}
Snake.prototype = new GameObject();
Snake.prototype.constructor = Snake;

var Pellet = function() {
  this.tileX = Math.floor(Math.random() * (800 / 20));
  this.tileY = Math.floor(Math.random() * (600 / 20));

  this.respawn = function() {
    this.tileX = Math.floor(Math.random() * (800 / 20));
    this.tileY = Math.floor(Math.random() * (600 / 20));
  }

  this.draw = function(context) {
    this.drawTile(context, this.tileX, this.tileY, this.BROWN);
  }
};
Pellet.prototype = new GameObject();
Pellet.prototype.constructor = Pellet;

window.gameManager.objects.push(new Snake());
window.gameManager.objects.push(new Pellet());

window.onkeydown = function handleKeyDown(e) {
  if (e.keyCode == '38') {
    window.gameManager.triggerKey('triggerUpKey');
  }
  else if (e.keyCode == '37') {
    window.gameManager.triggerKey('triggerLeftKey');
  }
  else if (e.keyCode == '39') {
    window.gameManager.triggerKey('triggerRightKey');
  }
  else if (e.keyCode == '40') {
    window.gameManager.triggerKey('triggerDownKey');
  }
}

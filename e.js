var Param = {
  Screen: {Width: 320, Height: 175},
  Wall: {Width: 320, Height: 179, Cor: {Top: 0.95, Right: 1, Left: 1}},
  Bar: {Width: 50, Height: 2, VMax: 2},
  Block: {Width: 8, Height: 8, Margin: 0, Cor: {Top: 1, Right: 1, Bottom: 0.9, Left: 1}},
  Ball: {Color: "rgba(48,157,255,1)", ColorPowered: "rgba(0,128,255,1)", Radius: 5, AvDamp: 0.75, Av: -5},
  Particle: {Length: 150},
  Score: {FontSize: 32, Color: "rgba(255,255,255,0.1)"},
  Point: {FontSize: 10, MaxLife: 30},
  Gravity: 0.075
};
var Button = {Left: 14, Right: 15};
var Stick = {Left: {X: 0, Y: 1}};

var isZero = function(aVal) {
  var epsilon = 0.0001;
  return (-epsilon <= aVal && aVal <= epsilon);
};

function Vec2(aX, aY) {
  this.x = aX;
  this.y = aY;
}
Vec2.prototype = {
  add: function(aVec) {
      this.x += aVec.x;
      this.y += aVec.y;
  },
  sqLength: function() {
      return this.x * this.x + this.y * this.y;
  },
  length: function() {
      return Math.sqrt(this.sqLength());
  },
  sqDist: function(aVec) {
      return Math.pow(this.x - aVec.x, 2) + Math.pow(this.y - aVec.y, 2);
  },
  dist: function(aVec) {
      return Math.sqrt(this.sqDist(aVec));
  }
};

function Layer(idx) {
  this.size = new Vec2(Param.Screen.Width, Param.Screen.Height);
  this.node;
  this.ctx;
  this.idx = idx;
  this.init();
}
Layer.prototype = {
  init: function() {
      this.node = document.createElement("canvas");
      document.body.appendChild(this.node);
      this.ctx = this.node.getContext("2d");
      this.node.setAttribute("width", this.size.x);
      this.node.setAttribute("height", this.size.y);
      var style = this.node.style;
      style.width = this.size.x + "px";
      style.height = this.size.y + "px";
      style.position = "fixed";
      style.left = 0;
      style.top = 37 + "px";
      style.display = "block";
      style.backgroundColor = "transparent";
      style.zIndex = 1 + this.idx;
      if (this.idx === 0) {
          style.zIndex = 1;
      }
  }
};

function Screen() {
  this.size = new Vec2(Param.Screen.Width, Param.Screen.Height);
  this.layers = [];
  this.ctx;
  this.dark = 0;
  this.darkProp = 0;
  this.init();
}
Screen.prototype = {
  init: function() {
      for (var i = 0; i < 4; ++i) {
          this.layers[i] = new Layer(i);
      }
      var style = document.body.style;
      style.background = "-webkit-linear-gradient(top,#0a0a0a,#0a0a0a 50%,#000 50%,#000)";
      style.WebkitBackgroundSize = "4px 4px";
  },
  draw: function(aObj) {
      if (aObj instanceof Bar) {
          this.drawBar(aObj.pos, aObj.size, aObj.color, 2);
      } else if (aObj instanceof Block) {
          this.drawBlock(aObj.pos, aObj.size, aObj.color, 0);
      } else if (aObj instanceof Ball) {
          this.drawBall(aObj.pos, aObj.radius, aObj.color, 2);
      } else if (aObj instanceof Score) {
          this.drawScore(aObj.pos, aObj.fontSize, aObj.color, aObj.toString(), 3);
      } else if (aObj instanceof Point) {
          this.drawPoint(aObj.pos, aObj.strokeColor, aObj.fillColor, aObj.value, aObj.size, 3);
      } else if (aObj instanceof Particle) {
          this.drawParticle(aObj.pos, aObj.v, aObj.radius, aObj.color, aObj.layer);
      }
  },
  drawBar: function(aPos, aSize, aColor, aLayerIdx) {
      var ctx = this.layers[aLayerIdx].ctx;
      ctx.fillStyle = aColor;
      ctx.fillRect(aPos.x, aPos.y, aSize.x, aSize.y);
      ctx.beginPath();
      ctx.arc(aPos.x + aSize.x / 2, aPos.y + 198.5, aSize.x * 4, 262.35 * Math.PI / 180, 277.65 * Math.PI / 180, false);
      ctx.fill();

  },
  drawBlock: function(aPos, aSize, aColor, aLayerIdx) {
      var ctx = this.layers[aLayerIdx].ctx;

      ctx.fillStyle = aColor;
      ctx.fillRect(aPos.x, aPos.y, aSize.x, aSize.y);

      var grad = ctx.createLinearGradient(aPos.x, aPos.y, aPos.x + aSize.x, aPos.y + aSize.y * 0.75);
      grad.addColorStop(0, "rgba(255,255,255,0.5)");
      grad.addColorStop(0.1, "rgba(255,255,255,0.075)");
      grad.addColorStop(0.5, "rgba(255,255,255,0.075)");
      grad.addColorStop(0.6, "rgba(255,255,255,0)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(aPos.x, aPos.y, aSize.x, aSize.y);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(aPos.x + aSize.x, aPos.y + 0.5);
      ctx.lineTo(aPos.x + 0.5, aPos.y + 0.5);
      ctx.lineTo(aPos.x + 0.5, aPos.y + aSize.y);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(aPos.x + aSize.x - 0.5, aPos.y);
      ctx.lineTo(aPos.x + aSize.x - 0.5, aPos.y + aSize.y - 0.5);
      ctx.lineTo(aPos.x, aPos.y + aSize.y - 0.5);
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.stroke();
  },
  drawParticle: function(aPos, aV, aRadius, aColor, aLayerIdx) {
      var ctx = this.layers[aLayerIdx].ctx;
      ctx.fillStyle = aColor;
      ctx.fillRect(aPos.x - aRadius, aPos.y - aRadius, aRadius * 2, aRadius * 2);
  },
  drawBall: function(aPos, aRadius, aColor, aLayerIdx) {
      var ctx = this.layers[aLayerIdx].ctx;
      ctx.save();
      ctx.translate(aPos.x, aPos.y);
      ctx.rotate(game.ball.theta * Math.PI / 180);
      ctx.translate(-aPos.x, -aPos.y);
      ctx.strokeStyle = aColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(aPos.x, aPos.y, aRadius, 0, Math.PI * 2, false);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(aPos.x - aRadius / 1.35, aPos.y, aRadius * 1.2, -Math.PI / 3, Math.PI / 3, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(aPos.x + aRadius / 1.35, aPos.y, aRadius * 1.2, Math.PI / 3 * 2, Math.PI / 3 * 4, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(aPos.x - aRadius / 1.25, aPos.y - aRadius / 2);
      ctx.lineTo(aPos.x + aRadius / 1.25, aPos.y - aRadius / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(aPos.x - aRadius, aPos.y);
      ctx.lineTo(aPos.x + aRadius, aPos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(aPos.x - aRadius / 1.25, aPos.y + aRadius / 2);
      ctx.lineTo(aPos.x + aRadius / 1.25, aPos.y + aRadius / 2);
      ctx.stroke();
      ctx.restore();
  },
  drawScore: function(aPos, aFontSize, aColor, aScore, aLayerIdx) {
      var ctx = this.layers[aLayerIdx].ctx;
      ctx.font = aFontSize + "px normal";
      ctx.textAlign = "end";
      ctx.textBaseline = "bottom";
      ctx.fillStyle = aColor;
      ctx.fillText(aScore, aPos.x, aPos.y);
  },
  drawPoint: function(aPos, aStrokeColor, aFillColor, aValue, aSize, aLayerIdx) {
      var ctx = this.layers[aLayerIdx].ctx;
      ctx.font = (10 + aSize / 2) + "px normal";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.strokeStyle = aStrokeColor;
      ctx.strokeText(aValue, aPos.x, aPos.y);
      ctx.fillStyle = aFillColor;
      ctx.fillText(aValue, aPos.x, aPos.y);
  },
  erase: function(aObj) {
      if (aObj instanceof Block) {
          this.eraseRect(aObj.pos, aObj.size, 0);
      }
  },
  eraseRect: function(aPos, aSize, aLayerIdx) {
      var ctx = this.layers[aLayerIdx].ctx;
      ctx.clearRect(aPos.x, aPos.y, aSize.x, aSize.y);
  }
};

function Game() {
  this.wall;
  this.ctx;
  this.blocks = [];
  this.bar;
  this.ball;
  this.points = [];
  this.score;
  this.combo = 0;
  this.screen;
  this.particles = [];
  this.cleared = false;
}
Game.prototype = {
  process: function() {

      var that = this;
      window.webkitRequestAnimationFrame(function() {
          that.process();
      });

      {
          var pad = navigator.webkitGetGamepads()[0];
          {
              if (pad.buttons[Button.Left] !== 0) {
                  this.bar.move(-Param.Bar.VMax);
              } else if (pad.buttons[Button.Right] !== 0) {
                  this.bar.move(Param.Bar.VMax);
              }
              if (!isZero(pad.axes[Stick.Left.X])) {
                  this.bar.move(Param.Bar.VMax * pad.axes[Stick.Left.X]);
              }
          }
          if (pad.buttons[Button.Left] !== 0) {
              this.bar.move(-Param.Bar.VMax);
          } else if (pad.buttons[Button.Right] !== 0) {
              this.bar.move(Param.Bar.VMax);
          }
          if (!isZero(pad.axes[Stick.Left.X])) {
              this.bar.move(Param.Bar.VMax * pad.axes[Stick.Left.X]);
          }
      }

      {
          this.ball.process();
          this.bar.process();
          var points = [];
          for (var i = 0; i < this.points.length; ++i) {
              var point = this.points[i];
              point.process();
              if (point.life > 0) {
                  points.push(point);
              }
          }
          this.points = points;
          this.score.process();
          var aliveCount = 0;
          for (var i = 0; i < this.blocks.length; ++i) {
              if (this.blocks[i].alive) {
                  ++aliveCount;
                  break;
              }
          }
          if (aliveCount === 0 && !this.cleared) {
              this.clear();
          }
          for (var i = 0; i < Param.Particle.Length; ++i) {
              if (this.particles[i].isReady) {
                  continue;
              }
              this.particles[i].process();
          }
      }

      {
          this.screen.layers[2].ctx.clearRect(0, 0, Param.Wall.Width, Param.Wall.Height);
          this.screen.layers[3].ctx.clearRect(0, 0, Param.Wall.Width, Param.Wall.Height);
          this.screen.draw(this.bar);
          if (this.ball.alive) {
              this.screen.draw(this.ball);
          }
          for (var i = 0; i < Param.Particle.Length; ++i) {
              if (this.particles[i].isReady) {
                  continue;
              }
              this.screen.draw(this.particles[i]);
          }
          for (var i = 0; i < this.points.length; ++i) {
              this.screen.draw(this.points[i]);
          }
          if (this.cleared) {
              this.screen.dark += this.screen.darkProp;
              this.screen.layers[1].ctx.fillStyle = new Color(0, 0, 0, game.screen.dark).toString();
              this.screen.layers[1].ctx.fillRect(0, 0, Param.Screen.Width, Param.Screen.Height);
          }
          this.screen.draw(this.score);
      }
  },
  addScore: function(aScore) {
      this.score.add(aScore);
  },
  spark: function(aPos, aV, aAmount, aColor, aSpread, aSame, aRadius, aLayer, aCallback) {
      for (var i = 0, j = 0; i < Param.Particle.Length && j < aAmount; ++i) {
          var particle = game.particles[i];
          if (particle.isReady) {
              particle.isReady = false;
              particle.color = aColor;
              particle.pos.x = aPos.x;
              particle.pos.y = aPos.y;
              particle.setV(aV, aSpread, aSame, aRadius, aLayer, aCallback);
              ++j;
          }
      }
  },
  over: function() {
      if (this.cleared) {
          return;
      }
      this.ball.alive = false;
      this.score.displayingScore = this.score.score;
      this.spark(new Vec2(this.ball.pos.x, this.ball.pos.y), new Vec2(0, 3), 50, this.ball.color);
      setTimeout(function() {
          location.reload();
      }, 1000);
  },
  clear: function() {
      game.screen.dark = 0;
      game.screen.darkProp = 0;
      game.cleared = true;
      setTimeout(function() {
          game.screen.dark = 0.05;
          game.screen.darkProp = 0.005;
          game.spark(new Vec2(Param.Screen.Width / 4, Param.Screen.Height), new Vec2(0, 8), 1, "rgb(235,190,145)", 0.001, true, 1.5, 1, function(aPos) {
              game.screen.dark = 0;
              game.screen.darkProp = 0.005;
              game.spark(aPos, new Vec2(0, 7), 75, new Color(240, 0, 0, 1).toString(), 12, false, 0.75, 1);
          });
      }, 250);
      setTimeout(function() {
          game.spark(new Vec2(Param.Screen.Width / 4 * 3, Param.Screen.Height), new Vec2(0, 8.5), 1, "rgb(235,190,145)", 0.001, true, 1.5, 1, function(aPos) {
              game.spark(aPos, new Vec2(0, 7), 75, new Color(240, 120, 0, 1).toString(), 12, false, 0.75, 1);
          });
      }, 500);
      setTimeout(function() {
          location.reload();
      }, 5000);
  }
};

function Particle(aX, aY) {
  this.pos = new Vec2(aX, aY);
  this.v;
  this.radius;
  this.color;
  this.isReady;
  this.same;
  this.callback;
  this.layer;
  this.init();
}
Particle.prototype = {
  init: function() {
      this.isReady = true;
      this.pos.x = -1;
      this.pos.y = -1;
      this.v = new Vec2(0, 0);
      this.radius = (Math.random() * 1 + 1) * 0.5;
      this.color = "#fff";
      this.callback = null;
      this.same = false;
      this.layer = 3;
  },
  process: function() {
      if (this.isReady) {
          return;
      }
      this.v.y += Param.Gravity;
      if (this.layer === 3) {
          this.pos.x += this.v.x;
          this.pos.y += this.v.y;
          this.radius *= 0.985;
      } else {
          this.pos.x += this.v.x / 3;
          this.pos.y += this.v.y / 3;
          this.radius *= 0.9999;
      }
      if (this.callback && this.v.y >= -4) {
          this.callback(this.pos);
          this.callback = null;
          this.init();
      }

      if ((this.radius < 0.05) || (this.pos.x < -20 || Param.Screen.Width + 20 < this.pos.x) || (this.pos.y < -20 || Param.Screen.Height + 20 < this.pos.y)) {
          this.init();
      }
  },
  setV: function(aV, aSpread, aSame, aRadius, aLayer, aCallback) {
      var angle = Math.atan2(-aV.y, -aV.x);
      var val = 0;
      for (var i = 0; i < 12; ++i) {
          val += Math.random();
      }
      val -= 6;
      val /= 6;
      angle += val * Math.PI * (aSpread ? aSpread : 1);
      var v = aSame ? aV.length() : Math.max(4, aV.length()) * (Math.random() * 0.5 + 0.4);
      if (aRadius) {
          this.radius = aRadius;
      }
      if (aLayer) {
          this.layer = aLayer;
      }
      this.same = aSame;
      this.callback = aCallback;
      this.v.x = v * Math.cos(angle);
      this.v.y = v * Math.sin(angle);
  }
};

function Point(aX, aY, aCombo) {
  this.pos = new Vec2(aX, aY);
  this.combo = aCombo;
  this.value;
  this.size = 0;
  this.life = Param.Point.MaxLife;
  this.fillColor = new Color(255, 255, 255, 1).toString();
  this.strokeColor = new Color(32, 32, 32, 0.25).toString();
  this.init();
}
Point.prototype = {
  init: function() {
      if (this.combo <= 7) {
          this.value = Math.min(8000, 100 * Math.pow(2, this.combo));
          this.size = this.combo;
      } else if (this.combo <= 9) {
          this.size = 8;
          this.value = 12000;
      } else if (this.combo <= 12) {
          this.size = 9;
          this.value = 16000;
      } else if (this.combo <= 14) {
          this.size = 10;
          this.value = 24000;
      } else {
          this.size = 11;
          this.value = 32000;
      }
  },
  process: function() {
      if (--this.life === 20) {
          game.addScore(this.value);
      }
      this.pos.y += -0.5;
      if (this.life < 20) {
          var prop = (this.life - 10) / (Param.Point.MaxLife - 10);
          this.fillColor = new Color(255, 255, 255, prop).toString();
          this.strokeColor = new Color(32, 32, 32, 0.25 * prop).toString();
      }
  }
};

function Score(aX, aY) {
  this.pos = new Vec2(aX, aY);
  this.fontSize = Param.Score.FontSize;
  this.color = Param.Score.Color;
  this.score = 0;
  this.displayingScore = 0;
}
Score.prototype = {
  add: function(aScore) {
      this.score += aScore;
  },
  toString: function() {
      return ("0000000" + this.displayingScore).slice(-7);
  },
  process: function() {
      var diff = this.score - this.displayingScore;
      if (diff <= 0)
          return;
      if (diff >= 50000) {
          this.displayingScore += 10000;
      }
      if (diff >= 5000) {
          this.displayingScore += 1000;
      }
      if (diff >= 500) {
          this.displayingScore += 100;
      }
      if (diff > 0) {
          this.displayingScore += 10;
      }
  }
};

function Wall(aX, aY, aColor) {
  this.pos = new Vec2(aX, aY);
  this.size = new Vec2(Param.Wall.Width, Param.Wall.Height);
  this.color = aColor;
  this.t = this.pos.y;
  this.r = this.pos.x + this.size.x;
  this.b = this.pos.y + this.size.y;
  this.l = this.pos.x;
}

function Bar(aX, aY, aColor) {
  this.pos = new Vec2(aX, aY);
  this.v = new Vec2(0, 0);
  this.size = new Vec2(Param.Bar.Width, Param.Bar.Height);
  this.color = aColor;
  this.t = this.pos.y;
  this.r = this.pos.x + this.size.x;
  this.b = this.pos.y + this.size.y;
  this.l = this.pos.x;
}
Bar.prototype = {
  process: function() {
      this.v.x = 0;
  },
  move: function(dx) {
      this.pos.x = Math.max(0, Math.min(Param.Wall.Width - this.size.x, this.pos.x + dx));
      this.r = this.pos.x + this.size.x;
      this.l = this.pos.x;
      this.v.x = dx;
  },
  moveTo: function(x, isSeries) {
      this.v.x = isSeries ? Math.max(-4, Math.min(4, x - (this.size.x >> 1) - this.pos.x)) : 0;
      this.pos.x = Math.max(0, Math.min(Param.Wall.Width - this.size.x, x - (this.size.x >> 1)));
      this.r = this.pos.x + this.size.x;
      this.l = this.pos.x;
  },
  center: function() {
      return new Vec2(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
  }
};

function Block(aX, aY, aColor) {
  this.pos = new Vec2(aX, aY);
  this.size = new Vec2(Param.Block.Width, Param.Block.Height);
  this.t = this.pos.y;
  this.r = this.pos.x + this.size.x;
  this.b = this.pos.y + this.size.y;
  this.l = this.pos.x;
  this.color = aColor;
  this.alive = true;
  game.screen.draw(this);
}
Block.prototype = {
  center: function() {
      return new Vec2(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
  },
  disappear: function() {
      game.screen.erase(this);
      game.spark(new Vec2((this.center().x + game.ball.pos.x) / 2, (this.center().y + game.ball.pos.y) / 2), game.ball.v, 20, this.color);
  }
};

function Ball(aX, aY, aVx, aVy, aColor) {
  this.pos = new Vec2(aX, aY);
  this.prevPos = new Vec2(0, 0);
  this.v = new Vec2(aVx, aVy);
  this.theta = 0;
  this.w = Param.Ball.Av;
  this.radius = Param.Ball.Radius;
  this.color = aColor;
  this.collided = false;
  this.powered = false;
  this.alive = true;
  this.count = 0;
}
Ball.prototype = {
  collisionWith: function(aObj) {
      if (aObj instanceof Wall) {
          this.collisionWithWall(aObj);
      } else if (aObj instanceof Block) {
          this.collisionWithBlock(aObj);
      } else if (aObj instanceof Bar) {
          this.collisionWithBar(aObj);
      } else if (aObj instanceof Array && aObj[0] instanceof Block) {
          this.collisionWithBlocks(aObj);
      }
  },
  collisionWithWall: function(aWall) {
      if (this.pos.y - this.radius <= aWall.t) {
          this.pos.y = aWall.t + this.radius;
          var dy = this.pos.y - this.prevPos.y;
          if (!isZero(this.v.y)) {
              this.pos.x += this.v.x * (dy / this.v.y);
          }
          this.v.y *= -Param.Wall.Cor.Top;
          this.w *= Param.Ball.AvDamp;
          this.collided = true;
      }
      if (this.pos.x + this.radius >= aWall.r) {
          this.pos.x = aWall.r - this.radius;
          var dx = this.pos.x - this.prevPos.x;
          if (!isZero(this.v.x)) {
              this.pos.y += this.v.y * (dx / this.v.x);
          }
          this.v.x *= -Param.Wall.Cor.Right;
          this.w *= Param.Ball.AvDamp;
          this.collided = true;
      }
      if (this.pos.y + this.radius >= aWall.b) {
          game.over();
      }
      if (this.pos.x - this.radius <= aWall.l) {
          this.pos.x = aWall.l + this.radius;
          var dx = this.pos.x - this.prevPos.x;
          if (!isZero(this.v.x)) {
              this.pos.y += this.v.y * (dx / this.v.x);
          }
          this.v.x *= -Param.Wall.Cor.Left;
          this.w *= Param.Ball.AvDamp;
          this.collided = true;
      }
  },
  collisionWithBlock: function(aBlock) {
      if (aBlock.center().dist(this.pos) > this.radius + aBlock.center().dist(new Vec2(aBlock.l, aBlock.t))) {
          return;
      }
      if (aBlock.l <= this.pos.x && this.pos.x <= aBlock.r) {
          if (this.v.y >= 0 && aBlock.t - this.radius <= this.pos.y && this.pos.y <= aBlock.t + this.radius) {
              aBlock.alive = false;
              if (this.powered) {
                  return;
              }
              this.v.y *= -Param.Block.Cor.Top;
          } else if (this.v.y <= 0 && aBlock.b - this.radius <= this.pos.y && this.pos.y <= aBlock.b + this.radius) {
              aBlock.alive = false;
              if (this.powered) {
                  return;
              }
              this.v.y *= -Param.Block.Cor.Bottom;
          }
      } else if (aBlock.t <= this.pos.y && this.pos.y <= aBlock.b) {
          if (this.v.x >= 0 && aBlock.l - this.radius <= this.pos.x && this.pos.x <= aBlock.l + this.radius) {
              aBlock.alive = false;
              if (this.powered) {
                  return;
              }
              this.v.x *= -Param.Block.Cor.Left;
          } else if (this.v.x <= 0 && aBlock.r - this.radius <= this.pos.x && this.pos.x <= aBlock.r + this.radius) {
              aBlock.alive = false;
              if (this.powered) {
                  return;
              }
              this.v.x *= -Param.Block.Cor.Right;
          }
      }

      if (aBlock.alive) {
          if (this.pos.dist(new Vec2(aBlock.l, aBlock.t)) <= this.radius) {
              aBlock.alive = false;
              if (this.powered) {
                  return;
              }
              this.v.x = -Math.abs(this.v.x * Param.Block.Cor.Left);
              this.v.y = -Math.abs(this.v.y * Param.Block.Cor.Top);
          } else if (this.pos.dist(new Vec2(aBlock.r, aBlock.t)) <= this.radius) {
              aBlock.alive = false;
              if (this.powered) {
                  return;
              }
              this.v.x = Math.abs(this.v.x * Param.Block.Cor.Right);
              this.v.y = -Math.abs(this.v.y * Param.Block.Cor.Top);
          } else if (this.pos.dist(new Vec2(aBlock.r, aBlock.b)) <= this.radius) {
              aBlock.alive = false;
              if (this.powered) {
                  return;
              }
              this.v.x = Math.abs(this.v.x * Param.Block.Cor.Right);
              this.v.y = Math.abs(this.v.y * Param.Block.Cor.Bottom);
          } else if (this.pos.dist(new Vec2(aBlock.l, aBlock.b)) <= this.radius) {
              aBlock.alive = false;
              if (this.powered) {
                  return;
              }
              this.v.x = -Math.abs(this.v.x * Param.Block.Cor.Left);
              this.v.y = Math.abs(this.v.y * Param.Block.Cor.Bottom);
          }
      }
  },
  collisionWithBlocks: function(aBlocks) {
      for (var i = 0; i < aBlocks.length; ++i) {
          var block = game.blocks[i];
          if (!block.alive) {
              continue;
          }
          this.collisionWith(block);
          if (!block.alive) {
              this.collided = true;
              block.disappear();
              var center = block.center();
              game.points.push(new Point(Math.max(32, Math.min(Param.Screen.Width - 32, center.x)), Math.max(24, center.y), game.combo++));
              if (this.powered) {
                  continue;
              }
              this.w *= Param.Ball.AvDamp;
              this.w += (Math.random() - 0.5) * 2.5;
              break;
          }
      }
  },
  collisionWithBar: function(aBar) {
      if (aBar.l - this.radius <= this.pos.x
              && this.pos.x <= aBar.r + this.radius
              && aBar.t - this.radius <= this.pos.y
              && this.pos.y <= aBar.b) {
          this.pos.y = aBar.t - this.radius - Param.Bar.Height;
          var dy = this.pos.y - this.prevPos.y;
          if (!isZero(this.v.y)) {
              this.pos.x += this.v.x * (dy / this.v.y);
          }
          this.v.x *= 0.9;
          this.v.x += aBar.v.x / 10;
          this.w *= Param.Ball.AvDamp;
          this.w = (this.w > 0 ? 1 : -1) * Math.min(15, Math.abs(this.w));
          this.w -= aBar.v.x * 5;
          this.v.y *= 1.05;

          var t = Math.asin((aBar.center().x - this.pos.x) / (aBar.size.x * 4));
          var vx = this.v.x, vy = this.v.y;
          var s = Math.sin(t), c = Math.cos(t);
          this.v.x = vx * c - vy * s;
          this.v.y = -vx * s - vy * c;

          if (this.pos.x <= aBar.l + this.radius / 2) {
              this.v.x = -Math.abs(this.v.x);
          } else if (aBar.r - this.radius / 2 <= this.pos.x) {
              this.v.x = Math.abs(this.v.x);
          }
          game.combo = 0;
          this.collided = true;
      }
  },
  process: function() {
      if (!this.alive) {
          return;
      }
      if (this.collided) {
          this.collided = false;
          return;
      }
      this.prevPos.x = this.pos.x;
      this.prevPos.y = this.pos.y;
      this.pos.x += this.v.x;
      this.v.y += Param.Gravity;
      this.pos.y += this.v.y;
      this.collisionWith(game.bar);
      this.collisionWith(game.wall);
      this.collisionWith(game.blocks);

      this.v.x = Math.min(5, this.v.x);
      this.v.y = Math.min(5, this.v.y);
      this.theta += this.w;
      if (Math.abs(this.w) > 20) {
          this.powered = true;
          this.color = this.count > 1 ? Param.Ball.Color : Param.Ball.ColorPowered;
      } else {
          this.powered = false;
          this.color = Param.Ball.Color;
      }
      this.count = (this.count + 1) % 4;
  }
};

function Color(aRed, aGreen, aBlue, aAlpha) {
  this.r = aRed;
  this.g = aGreen;
  this.b = aBlue;
  this.a = aAlpha;
}
Color.prototype = {
  toString: function() {
      return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
  }
};

var game;
(function() {

  (function() {
      game = new Game();
      game.screen = new Screen();
      game.bar = new Bar((Param.Screen.Width - Param.Bar.Width) >> 1, 172, "#ddd");
      game.ball = new Ball(165, 150, -0.25, 3, Param.Ball.Color);
      game.wall = new Wall(0, 0, "transparent");
      game.score = new Score(Param.Screen.Width - 2, Param.Screen.Height - 2);
      for (var i = 0; i < Param.Particle.Length; ++i) {
          game.particles[i] = new Particle(-1, -1);
      }
  })();

  (function() {
      var d = document, body = d.body;
      //body.removeChild(d.getElementById("container"));
      //body.removeChild(d.getElementsByTagName("svg")[0]);
      d.ontouchstart = function(e) {
          game.bar.moveTo(e.touches[0].pageX, false);
      };
      d.ontouchmove = function(e) {
          game.bar.moveTo(e.touches[0].pageX, true);
      };
  })();

  (function() {
      var charDots, charData;
      (function() {
          var chars = "0123456789abcdefghijklmnopqrstuvwxyz.-?";
          charDots = [
              //0  1  2   3   4   5   6   7   8   9   a   b   c   d   e   f   g   h   i j  k   l m     n   o   p   q   r   s   t  u   v   w     x   y   z   . -   ?
              "010 01 010 111 001 111 011 111 010 010 000 100 000 001 000 001 000 100 1 01 100 1 00000 000 000 000 000 000 000 10 000 000 00000 000 000 000 0 000 111",
              "101 11 101 001 011 100 100 001 101 101 110 110 010 011 010 010 011 100 0 00 100 1 11010 110 010 010 010 110 011 11 101 101 10101 101 101 111 0 000 101",
              "101 01 001 010 101 110 110 001 010 011 001 101 101 101 101 111 101 110 1 01 100 1 10101 101 101 101 101 101 100 10 101 101 10101 101 101 001 0 000 101",
              "101 01 010 001 101 001 101 010 101 001 011 101 100 101 111 010 101 101 1 01 101 1 10101 101 101 101 101 100 010 10 101 101 10101 010 101 010 0 111 101",
              "101 01 100 101 111 001 101 010 101 101 101 101 101 101 100 010 011 101 1 01 110 1 10101 101 101 101 101 100 001 10 101 101 10101 101 011 100 0 000 101",
              "010 01 111 010 001 110 010 010 010 010 011 110 010 011 011 010 001 101 1 01 101 1 10101 101 010 110 011 100 110 01 111 010 01010 101 001 111 1 000 111",
              "000 00 000 000 000 000 000 000 000 000 000 000 000 000 000 000 110 000 0 10 000 0 00000 000 000 100 001 000 000 00 000 000 00000 000 110 000 0 000 000"
          ];
          for (var i = 0; i < 7; ++i) {
              charDots[i] = charDots[i].split(" ");
          }
          charData = {};
          for (var i = 0; i < chars.length; ++i) {
              var datum = charData[chars.charAt(i)] = [];
              for (var j = 0; j < 7; ++j) {
                  datum[j] = charDots[j][i];
              }
          }
      })();

      var domain;
      (function() {
          domain = "";
          var _domain = window.location.href.split("/")[2].toLowerCase();
          for (var i = 0; i < _domain.length; ++i) {
              var char = _domain.charAt(i);
              if (charData[char]) {
                  domain += char;
              } else {
                  domain += "?";
              }
          }
      })();

      var startPos, width1stLine, width2ndLine;
      (function() {
          var MaxColLength = 38, MaxRowLength = 2;
          var string1stLine = "", string2ndLine = "";
          var width = 0;
          width1stLine = -1;
          width2ndLine = -1;
          for (var i = 0; i < domain.length; ++i) {
              var char = domain.charAt(i);
              var length = charData[char][0].length + 1;
              width += length;
              if (width <= MaxColLength) {
                  width1stLine += length;
                  string1stLine += char;
              } else if (width2ndLine + length <= MaxColLength) {
                  width2ndLine += length;
                  string2ndLine += char;
              } else {
                  break;
              }
          }
          if (width2ndLine > -1) {
              while (width1stLine > width2ndLine) {
                  var char = string1stLine.charAt(string1stLine.length - 1);
                  var length = charData[char][0].length + 1;
                  if (width1stLine < width2ndLine + length * 2) {
                      break;
                  }
                  string1stLine = string1stLine.substr(0, string1stLine.length - 1);
                  width1stLine -= length;
                  string2ndLine = char + string2ndLine;
                  width2ndLine += length;
              }
          }
          startPos = new Vec2((Param.Screen.Width - (Param.Block.Width + Param.Block.Margin) * MaxColLength + Param.Block.Margin) >> 1, (Param.Block.Height * 3) >> 1);
          if (width <= MaxColLength) {
              startPos.x += (Param.Block.Width * (MaxColLength - width)) >> 1;
              startPos.y += Param.Block.Height * 6;
          } else {
              startPos.x += (Param.Block.Width * (MaxColLength - Math.max(width1stLine, width2ndLine))) >> 1;
          }
      })();

      (function() {
          var Colors = ["#e60012", "#f39800", "#fff100", "#009944", "#0068b7", "#1d2088", "#920783"];
          for (var i = 0, l = 0, m = 0; i < domain.length; ++i) {
              var char = domain.charAt(i);
              var datum = charData[char];
              if ((m === 0 && l > width1stLine) || (m === 1 && l > width2ndLine)) {
                  ++m;
                  l = 0;
                  if (m >= 2) {
                      break;
                  }
              }
              for (var j = 0; j < 7; ++j) {
                  for (var k = 0; k < datum[0].length; ++k) {
                      if (datum[j].charAt(k) === "0") {
                          continue;
                      }
                      game.blocks.push(new Block(startPos.x + (Param.Block.Width + Param.Block.Margin) * (k + l), startPos.y + (Param.Block.Height + Param.Block.Margin) * (j + 8 * m), Colors[Math.floor((j + 7 * m) / 2)]));
                  }
              }
              l += datum[0].length + 1;
          }
      })();
  })();

  window.webkitRequestAnimationFrame(function() {
      game.process();
  });
})();

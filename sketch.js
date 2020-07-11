// GMTK 2020 game jam
// by Ben Hem, and Oran Collins
// github.com/wisehackermonkey
// oranbusiness@gmail.com
// 2020.07.09

/*
TODO LIST:
IMPERATIVE:
- ability to reset current level with same scramble

POSSIBLE FEATURES:

- special rules for each robot e.g.:
  red: flip R/L
  blue: flip U/D
  green: flip step/walk

- log that shows what's happening with symbols?
- robots leave trail?
- walls
- combat / auto-destroy robots
- text to speech with funny sayings

POLISHING:
- robot art
- easing with movement

*/

let robots = [], keys=[], gamestep = 0, mapsize=20, gs = 20;
let goals = [], starting_positions = [], scramble;
let footstepfx;
let colors=[];

function preload(){
	footstepfx = loadSound ("sfx_movement_footsteps1b.wav");
}

function setup() {
	createCanvas(400, 400);
  colorMode(HSB,100);
	footstepfx.setVolume(0.01);
  keys[0] = "a";
  keys[1] = "d";
  keys[2] = "s";
  keys[3] = "w";
  colors[0] = 64; // blue
  colors[1] = 15; // yellow
  colors[2] = 0;  // red
  colors[3] = 40; // green
  scramble=new Array();
  starting_positions[0] = createVector(7,7);
  starting_positions[1] = createVector(12,7);
  starting_positions[2] = createVector(7,12);
  starting_positions[3] = createVector(12,12);
  for (let i=0;i<4;i++){
    goals[i] = new Goal(i);
    robots[i] = new Robot(i);
  }
  print("SCRAMBLING ROBOTS");
  while (any_robots_at_goal()){
    let N = int(random(4));
    scramble.push(N);
    instruction(N, true);
  }
  let cheatcode = new Array();
  for (let i=scramble.length-1; i>=0; i--){
    cheatcode.push(keys[scramble[i]]);
  }
  print ("TO CHEAT: " + cheatcode);
}

function soft_reset(){
  for (let i=0;i<4;i++){
    robots[i].pos = starting_positions[i].copy();
    robots[i].a = 0;
  }
  for (let i=0;i<scramble.length;i++){
    instruction(scramble[i], true);
  }
}

function draw() {
	background(80);
	stroke(100);
	for (let i = 0; i < mapsize; i++) {
		line(i * gs, 0, i * gs, height);
		line(0, i * gs, width, i * gs);
	}
  for (let i=0;i<goals.length;i++){
	  goals[i].render();
  }
  for (let i=0;i<robots.length;i++){
	  robots[i].render();
  }
}

function Robot(_id) {
	let h, id, a, glitches, issues;
  this.id=_id;
  this.h = colors[this.id];
  this.pos = starting_positions[this.id].copy();
  this.prev_pos = this.pos.copy();
	this.glitches = new Array(4);
	let options = [0, 1, 2, 3];
  this.glitches = shuffle(options);
	this.a = 0;

	this.instruction = (N, reverse) => {
		let gggggglitch = this.glitches[N];
		switch (gggggglitch) {
			case (0):
				this.turn(reverse?1:-1);
			break;
			case (1):
				this.turn(reverse?-1:1);
			break;
			case (2):
				this.step(reverse?1:-1);
			break;
			case (3):
				this.step(reverse?-1:1);
			break;
		}

		footstepfx.play()
	}

	this.turn = (dir) => {
		this.a += dir;
		this.a = (this.a + 4) % 4;
	};

	this.step = (dir) => {
    this.prev_pos = this.pos.copy();
		switch (this.a) {
			case (0):
				this.pos.x += dir;
			break;
			case (1):
				this.pos.y += dir;
			break;
			case (2):
				this.pos.x -= dir;
			break;
			case (3):
				this.pos.y -= dir;
			break;
		}
    for (let i=0;i<robots.length;i++){
      if (i!=this.id){ // don't check self
        if (robots[i].pos.x == this.pos.x && robots[i].pos.y == this.pos.y) {
          this.pos = this.prev_pos;
          robots[i].pos=robots[i].prev_pos;
          print ("ROBOT " + this.id + " BOUNCED OFF ROBOT " + i);
        }
      }
    }
    if (this.pos.x<0 || this.pos.y<0 || this.pos.x>=mapsize || this.pos.y>=mapsize){
      this.pos = this.prev_pos;
      print ("ROBOT " + this.id + " HIT WALL");
    }
    if (this.pos.x==goals[this.id].pos.x && this.pos.y==goals[this.id].pos.y) print ("ROBOT " + this.id + " AT GOAL");
	};

	this.render = () => {
		stroke(0);
    fill(this.h, 90, 90);
		push();
		translate(this.pos.x * gs + gs * .5, this.pos.y * gs + gs * .5);
		rotate(this.a * (PI / 2));
		ellipse(0, 0, gs, gs);
		line(0, 0, gs, 0);
		pop();
	};
}

function all_robots_at_goal(){
  for (let i=0;i<robots.length;i++){
    if (robots[i].pos.x != goals[i].pos.x || robots[i].pos.y != goals[i].pos.y) return false;
  }
  return true;
}

function any_robots_at_goal(){
  for (let i=0;i<robots.length;i++){
    if (robots[i].pos.x == goals[i].pos.x && robots[i].pos.y == goals[i].pos.y) return true;
  }
  return false;
}

function Goal(_id){
  this.id = _id;
  this.pos = starting_positions[this.id].copy();
  /*
  // back when there were random positions...
  this.pos.x = int(random(mapsize));
  this.pos.y = int(random(mapsize));
  // check for overlaps with other goals
  for (let i=0;i<goals.length;i++){
    if (this.id!=i){
      while (this.pos.x==goals[i].pos.x && this.pos.y==goals[i].pos.y){
        this.pos.x = int(random(mapsize));
        this.pos.y = int(random(mapsize));
      }
    }
  }
  */
  this.render= ()=>{
    push();
      noStroke();
      fill(colors[this.id],90,90);
      translate(this.pos.x*gs, this.pos.y*gs);
      square(0, 0, gs, gs);
    pop();
  }
}


function instruction(N, _reverse){
  for (let i=0;i<robots.length;i++){
    robots[i].instruction(N, _reverse);
  }
}

function keyPressed() {
  for (let i=0;i<4;i++){
    if (key==keys[i]) instruction(i, false);
  }
  if (key == 'h') setup();
  if (key == 'r') soft_reset();
}
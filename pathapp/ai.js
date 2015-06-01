
function AI(sx,sy,world) {
	this.world = world;
	this.pos = new Vec(sx,sy);
	this.prevPos = this.pos.clone();
	this.dir = new Vec(1,0);
	this.desiredDir = new Vec(1,0);
	//this.turnRate = 270.0;
	this.turnRate = 10000.0;
	this.speed = 0.0;
	this.loco = {
		goal: undefined,
		path: undefined,
		currIdx: 0,

		reset: function() {
			this.goal = undefined;
			this.path = undefined;
			this.currIdx = 0;
		},
	};
}

AI.prototype.corridorLineOfSight = function(start, end, width) {
	var world = this.world;
	var dir = Vec.sub(end,start);
	var sideNrm = Vec.normalize((Vec.rot(dir,90)));

	var tests = [];
	tests.push({start:Vec.addScale(start,sideNrm,width), dir:dir});
	tests.push({start:Vec.addScale(start,sideNrm,-width), dir:dir});

	return and(tests, function(t) {
		return world.lineOfSight(t.start,t.dir);
	});
}

// Find the futhest point on the path that has a clear line of 
// sight to the ai position.
// Starts the search on the path from startIndex (if not 
// provided starts from the beginning of the path).
AI.prototype.furthestLos = function(startIndex) {	
	var pos = this.pos;
	var world = this.world;
	var path = this.loco.path || [];
	var start = startIndex || 0;
	var furthest = start;
	for(var i=path.length-1; i>=start; i--) {
		var pathPos = path[i];
		if(this.corridorLineOfSight(pos,pathPos,10)) {
			furthest = i;
			break;
		}
	}

	return furthest;
}

// Set the speed that the AI will move at
// in units per second.
AI.prototype.setSpeed = function(s) {
	this.speed = s;
}

// The direction that the AI will turn towards and
// move along.
AI.prototype.setFaceDir = function(v) {
	this.desiredDir = v.clone();
}

// The goal is a position in the world that the 
// AI will navigate to.
AI.prototype.setGoal = function(goal) {
	var world = this.world;
	var pos = this.pos;
	var path = world.findPath(this.pos,goal);

	var loco = this.loco;
	if(path.length > 0) {
		loco.goal = goal;
		loco.path = path;
		loco.currIdx = 0;
	}
}

AI.prototype.updateLocomotion = function() {
	var currPos = bind(this.loco,
		function() {
			return this.currIdx < this.path.length ? 
						this.path[this.currIdx] :
						undefined;
		});
		
	this.setSpeed(0);

	var loco = this.loco;
	if(loco.path) {

		// Find the furthest visible node on
		// the path. If greater than the current
		// index move to the new point (to avoid
		// going backwards).
		var nextIdx = this.furthestLos(this.currIdx);
		if(nextIdx > loco.currIdx) {
			loco.currIdx = nextIdx;
		}

		// Always increment when the current node
		// is reached (to prevent getting stuck) and
		// to detect the end of the path.
		if(Vec.dist(this.pos,currPos()) < 2) {
			loco.currIdx++;
		}

		// Stop when the end is reached otherwise
		// move to the current poin
		if(!currPos()) {
			loco.reset();
		} else {
			var dir = Vec.sub(currPos(),this.pos);
			this.setFaceDir(dir);
			this.setSpeed(125);
		}
	}
}

AI.prototype.updateTurning = function(dt) {
	var ang = Vec.angle(this.dir,this.desiredDir);
	var maxAngle = ang < 90.0 ? 
			(this.turnRate * dt) : 360.0;
	var a = Math.min(ang,maxAngle);

	// Determine the direction to turn by comparing
	// the desired direction with a vector 
	// perpendicular to the current facing direction.
	var perp = Vec.rot(this.dir,90);
	if(Vec.dot(perp,this.desiredDir) < 0) {
		a *= -1;
	}

	this.dir = Vec.rot(this.dir,a);
}

AI.prototype.update = function(dt) {
	this.prevPos = this.pos.clone();
	this.pos = Vec.addScale(this.pos,this.dir,(this.speed*dt));

	this.updateLocomotion();
	this.updateTurning(dt);
}

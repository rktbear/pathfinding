
pathapp = {
	width: 0,
	height: 0,
	border: 2,
	canvas: undefined,
	ctx: undefined,
	world: undefined,
	selectPos: undefined,
	selectCell: undefined,
	path: undefined,
	ai: undefined,
	option: {
		navGrid: false,
		aiPath: false,
		touchNodes: false,
	}
};

pathapp.init = function(parentElement,width,height,layout) {
	this.width = width;
	this.height = height;
	var canvas = document.createElement("canvas");
	canvas.width = this.width + (this.border*2);
	canvas.height = this.height + (this.border*2);
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
 
	document.getElementById(parentElement).appendChild(canvas);

	this.world = new Grid(this.width,this.height,layout);
	this.world.init();

	var aiPos = find(this.world.cells,function(c) {
		return c.type == "X";
	});
	this.ai = new AI(aiPos.x,aiPos.y,this.world);

	canvas.addEventListener(
		"mousedown",
		bind(this, function(e) { 
	 		var cvsPos = {};
			var cvsPos = new Vec(e.pageX - canvas.offsetLeft,
					e.pageY - canvas.offsetTop);
					
			this.selectPos = cvsPos;

			this.ai.setGoal(cvsPos);
		}),
		true);

	var navGridCheckBox = document.getElementById("navGridCheckBox");
	var aiPathCheckBox = document.getElementById("aiPathCheckBox");
	var touchNodeCheckbox = document.getElementById("touchNodeCheckBox");

	navGridCheckBox.addEventListener(
		"change",
		bind(this, function(e) {
			this.option.navGrid = (navGridCheckBox.value == "on");
		}),
		true);

	aiPathCheckBox.addEventListener(
		"change",
		bind(this, function(e) {
			this.option.aiPath = (aiPathCheckBox.value == "on");
		}),
		true);

	touchNodeCheckBox.addEventListener(
		"change",
		bind(this, function(e) {
			this.option.touchNodes = (touchNodeCheckBox.value == "on")
		}),
		true);

	var pathTypeSelect = document.getElementById("pathTypeSelect");

	pathTypeSelect.addEventListener(
		"change",
		bind(this, function(e) {
			var value = pathTypeSelect.value;
			if(value == "Dijkstra") {
				this.world.navUseDijkstra();
			} else if(value == "A* (Manhattan)") {
				this.world.navUseAStarManhattan();
			} else if(value == "A* (Straight Line)") {
				this.world.navUseAStarLine();
			}
		}),
		true);

	setInterval(bind(this,pathapp.update), 30);
};

pathapp.renderAI = function() {
	var ctx = this.ctx;
	var ai = this.ai;
	end = Vec.addScale(ai.pos,ai.dir,20);

	ctx.fillStyle = "rgb(0,0,0)";
	ctx.beginPath();
	ctx.arc(ai.pos.x,ai.pos.y,7,0,Math.PI*2,false);
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = "rgb(0,255,0)";
	ctx.beginPath();
	ctx.arc(ai.pos.x,ai.pos.y,5,0,Math.PI*2,false);
	ctx.closePath();
	ctx.fill();
}

pathapp.renderPath = function() {
	var ctx = this.ctx;
	var ai = this.ai;
	var path = ai.loco.path || [];

	ctx.strokeStyle = "rgb(255,0,0)";
	ctx.lineWidth = 3;

	for(var i=0; i<(path.length-1); i++) {
		var p = path[i];
		var pn = path[i+1];
		ctx.beginPath();
		ctx.moveTo(p.x,p.y);
		ctx.lineTo(pn.x,pn.y);
		ctx.closePath();
		ctx.stroke();
	}

	if(ai.loco.path) {
		var goal = ai.loco.path[ai.loco.currIdx];
		ctx.fillStyle = "rgb(128,0,0)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(ai.pos.x,ai.pos.y);
		ctx.lineTo(goal.x,goal.y);
		ctx.closePath();
		ctx.stroke();
	}
}

pathapp.renderTouched = function() {
	var ctx = this.ctx;
	
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.strokeStyle = "rgb(0,0,0)";
	ctx.lineWidth = 2;

	forEach(this.world.cells, function(c) {
		if(c.visited) {
			ctx.fillRect(c.x-5,c.y-5,10,10);
		}

		if(c.shortest) {
			ctx.fillRect(c.x-2,c.y-2,4,4);
		
			var fromDir = Vec.sub(c.shortest,c);
			var fromPos = Vec.add(c,Vec.scale(fromDir,0.5));
			ctx.beginPath();
			ctx.moveTo(c.x,c.y);
			ctx.lineTo(fromPos.x,fromPos.y);
			ctx.closePath();
			ctx.stroke();
		}
	});
}

pathapp.renderNav = function() {
	var ctx = this.ctx;

	ctx.strokeStyle = "rgb(200,200,200)";
	ctx.lineWidth = 1;

	forEach(this.world.cells, function(c) {
		forEach(c.links, function(l) {
			ctx.beginPath();
			ctx.moveTo(c.x,c.y);
			ctx.lineTo(l.to.x,l.to.y);
			ctx.closePath();
			ctx.stroke();
		});
	});

	ctx.fillStyle = "rgb(0,0,0)";

	forEach(this.world.cells, function(c) {
		ctx.fillRect(c.x-2,c.y-2,4,4);
	});
};

pathapp.renderSelect = function() {
	var ctx = this.ctx;
	var spos = this.selectPos;
	var scell = this.selectCell;

	ctx.fillStyle = "rgb(0,0,255)";
	scell && ctx.fillRect(scell.x-5,scell.y-5,10,10);

	ctx.fillStyle = "rgb(255,0,0)";
	spos && ctx.fillRect(spos.x-2,spos.y-2,4,4);
};

pathapp.renderWorld = function() {
	var ctx = this.ctx;
	var grid = this.world;
	
	function renderWall(c) {
		var width = grid.cellWidth*0.5;
		var height = grid.cellHeight*0.5;
		ctx.fillRect(c.x-width,c.y-height,
						width*2,height*2);
	}
	
	ctx.fillStyle = "rgb(0,0,0)";
	
	forEach(filter(grid.cells, function(c) {
		return c.type=="#";
	}), renderWall);
}

pathapp.renderMetric = function() {
	var nodeTouchMetric = document.getElementById("nodeTouchMetric");

	nodeTouchMetric.innerHTML = this.world.metric.cellTouch;
}

pathapp.render = function() {
	var border = this.border;
	var cvs = this.canvas;
	var ctx = this.ctx;
	var width = this.width;
	var height = this.height;

	ctx.fillStyle = "rgb(0,0,0)";
	ctx.fillRect(0,0,cvs.width,cvs.height);

	ctx.fillStyle = "rgb(255,255,255)";
	ctx.fillRect(border,border,width,height);

	this.option.navGrid && this.renderNav();
	this.option.touchNodes && this.renderTouched();
	this.renderSelect();
	this.renderWorld();
	this.option.aiPath && this.renderPath();
	this.renderAI();
	this.renderMetric();
};

pathapp.update = function() {
	this.ai.update(0.03);
	this.render();
}

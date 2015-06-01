
function Grid(width,height,layout) {
	this.width = width;
	this.height = height;
	this.layout = layout;
	this.cells = [];
	
	// A cache of all the non navigable cells.
	this.cellWall = [];
	
	this.cellWidth = Math.floor(width / layout.width);
	this.cellHeight = Math.floor(height / layout.height);
	this.cellOffset = {
		x:this.cellWidth / 2,
		y:this.cellHeight / 2
	}

	this.metric = {
		cellTouch: 0
	};

	this.navUseDijkstra();
}

Grid.prototype.navUseDijkstra = function() {
	this.navHeuristic = createDijkstra();
}

Grid.prototype.navUseAStarManhattan = function() {
	this.navHeuristic = createManhattan();
}

Grid.prototype.navUseAStarLine = function() {
	this.navHeuristic = createStraightLine();
}

// Convert a world position to a cell position. 
// Finds the nearest cell to this position.
Grid.prototype.worldToCell = function(x,y) {
	var valid = 
		x >= 0 && x < this.width && 
		y >= 0 && y < this.height;

	x -= this.cellOffset.x;
	y -= this.cellOffset.y;

	var cx = Math.round(x / this.cellWidth);
	var cy = Math.round(y / this.cellHeight);

	return valid ? 
		cx+(cy*this.layout.width) : 
		undefined;
}

// Convert a cell position to a world position.
Grid.prototype.cellToWorld = function(x,y) {
	var valid = 
		x >= 0 && x < this.layout.width && 
		y >= 0 && y < this.layout.height;

	var wx = (x * this.cellWidth);
	var wy = (y * this.cellHeight);

	wx += this.cellOffset.x;
	wy += this.cellOffset.y;

	return valid ? 
		{x:wx, y:wy} : 
		undefined;
}

Grid.prototype.getCell = function(x,y) {
	var idx = this.worldToCell(x,y);
	return idx ? this.cells[idx] : undefined;
};

// Return true if there is a clear line of sight between
// the position 'start' in the direction 'dir'.
Grid.prototype.lineOfSight = function(start,dir) {
	var los = new Line(start,Vec.add(start,dir));
	
	return and(this.cellWall, bind(this, 
		function(c) {
			return and(c.box, curry(neg(Line.intersect),los));
		}));
}

// Return a list of 2D positions representing a path between
// 'start' and 'end'. If no path is found, the list is empty.
Grid.prototype.findPath = function(start,end) {
	var startCell = this.getCell(start.x,start.y);
	var endCell = this.getCell(end.x,end.y);
	
	var path = [];
	var nodeTouch = 0;
	if(endCell.type != "#") {
		var result = findRoute(this.cells,
			startCell,endCell,
			this.navHeuristic);

		nodeTouch = result[0];
		path = result[1];
	}

	// Add the end position because the route will
	// only contain graph node positions.
	this.metric.cellTouch = 0;
	if(path.length > 0) {
		path[path.length-1] = new Vec(end.x,end.y);
		this.metric.cellTouch = nodeTouch;
	}
	return path;
}

Grid.prototype.buildGrid = function() {
	var getMapCell = bind(this.layout,
		function(x,y) {
			var idx = x+(y*this.width);
			return this.map[idx];
		});

	for(var y=0; y<this.layout.height; y++) {
		for(var x=0; x<this.layout.width; x++) {
			var wp = this.cellToWorld(x,y);
			var cell = new Node(wp.x,wp.y);
			
			// Add the four points making 
			// up the cell.
			var width = this.cellWidth/2;
			var height = this.cellHeight/2;

			var points = [];
			points.push(new Vec(wp.x-width,wp.y-height));
			points.push(new Vec(wp.x-width,wp.y+height));
			points.push(new Vec(wp.x+width,wp.y-height));
			points.push(new Vec(wp.x+width,wp.y+height));
			
			var box = [];
			box.push(new Line(points[0],points[1]));
			box.push(new Line(points[0],points[2]));
			box.push(new Line(points[3],points[1]));
			box.push(new Line(points[3],points[2]));
			
			cell.points = points;
			cell.box = box;
			cell.type = getMapCell(x,y);
			this.cells.push(cell);
			
			if(cell.type == "#") {
				this.cellWall.push(cell);
			}
		}
	}
};

Grid.prototype.buildLinks = function() {
	var linkCells = bind(this, 
		function(from,tox,toy,dist) {
			var to = this.getCell(tox,toy);
			if(to && from && from.type != "#" && to.type != "#") {
				var adj0 = this.getCell(from.x,to.y);
				var adj1 = this.getCell(to.x,from.y);
				if((!adj0 || adj0.type != "#") && 
					(!adj1 || adj1.type != "#")) {
					to.addLink(from,dist);
					from.addLink(to,dist);
				}
			}
	});

	var width = this.cellWidth;
	var height = this.cellHeight;
	var diag = sqrt((width*width)+(height*height));

	this.cells.forEach(function(c) {
		var x=c.x, y=c.y;
		linkCells(c,x+width,y,width);
		linkCells(c,x,y+height,height);
		linkCells(c,x-width,y,width);
		linkCells(c,x,y-height,height);

		linkCells(c,x+width,y+height,diag);
		linkCells(c,x+width,y-height,diag);
		linkCells(c,x-width,y+height,diag);
		linkCells(c,x-width,y-height,diag);
	});
};

Grid.prototype.init = function() {
	this.buildGrid();
	this.buildLinks();
}

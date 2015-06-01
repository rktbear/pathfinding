
function Link(to,dist) {
	this.to = to;
	this.dist = dist;
};			

Link.prototype.updateDist = function(from,hfunc) {
	var to = this.to;
	var newg = from.g + this.dist;
	if(newg < to.g) {
		to.h = hfunc(to);
		to.g = newg;
		to.f = to.h+to.g;
		to.shortest = from;
	}
}

function Node(x,y) {
	this.x = x;
	this.y = y;
	this.links = [];
	this.reset();
};

Node.prototype.reset = function() {
	this.f = Number.MAX_VALUE;
	this.g = Number.MAX_VALUE;
	this.h = 0;
	this.visited = false;
	this.shortest = undefined;
}

Node.prototype.addLink = function(n,dist) {
	n && this.links.push(new Link(n,dist));
};

// Return the node with the smallest f-value.
function findSmallestF(list) {
	var smallest;
	forEach(list,function(n) {
		if(n.visited == false)
			if(!smallest || n.f < smallest.f) {
				smallest = n;
			}
		});
	return smallest;
};

function createManhattan() {
	return function(startNode,endNode,node) {
		var dist = (Math.abs(node.x-endNode.x)+
					Math.abs(node.y-endNode.y))
        return dist;
	};
}

function createStraightLine() {
	return function(startNode,endNode,node) {
		var dist = Vec.dist(node,endNode);
		return dist;
	}
}

function createDijkstra() {
	return function() {
		return 0.0;
	}
}

// Find the shortest route on a graph (list of Node
// objects) between a start and end node.
// Returns an array of points making up the path;
// if no path is found returns undefined.
function findRoute(graph,startNode,endNode,hfunc) {
	var hpart = curry(hfunc,startNode,endNode);
	forEach(graph, function(n) {
        n.reset();
	});

	var currNode = startNode;
	currNode.g = 0.0;
	currNode.h = 0.0;
	currNode.f = 0.0;

	var nodeTouch = 0;

	while(currNode) {
		if(currNode == endNode) {
			currNode.visited = true;
			break;
		}

		forEach(currNode.links, function(l) {
			!l.to.visited && l.updateDist(currNode,hpart);
		});

		currNode.visited = true;
		currNode = findSmallestF(graph);

		nodeTouch++;
	}

	var path = [];
	var node = endNode;
	while(node) {
		path.push(new Vec(node.x,node.y));
		node = node.shortest;
	}

	return path.length > 0 ? 
		[nodeTouch,path.reverse()] : [0,undefined];
}

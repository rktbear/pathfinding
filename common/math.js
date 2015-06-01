
function degToRad(d) {
	return d*(Math.PI / 180);
}

function radToDeg(r) {
	return r*(180 / Math.PI);
}

function abs(v) {
	return Math.abs(v);
}

function sqrt(v) {
	return Math.sqrt(v);
}

// Represents complex number a+bi.
function Complex(a,b) {
	// Real component.
	this.a = a;

	// Imaginary component.
	this.b = b;
}

Complex.prototype.clone = function() {
	return new Complex(this.a,this.b);
}

// Multiply two complex numbers:
// 	(a0+b0i)(a1+b1i) = 
// 		(a0*a1-b0*b1)+(a0*b1+b0*a1)i;
Complex.mul = function(c0,c1) {
	return new Complex((c0.a*c1.a)-(c0.b*c1.b),
			(c0.a*c1.b)+(c0.b*c1.a));
}

Complex.add = function(c0,c1) {
	return new Complex(c0.a+c1.a,c0.b*c1.b);
}

function Vec(x,y) {
	this.x = x;
	this.y = y;
}

Vec.prototype.clone = function() {
	return new Vec(this.x,this.y);
}

Vec.add = function(v0,v1) {
	return new Vec(v0.x+v1.x, v0.y+v1.y);
}

Vec.sub = function(v0,v1) {
	return new Vec(v0.x-v1.x, v0.y-v1.y);
}

Vec.addScale = function(v0,v1,s) {
	return new Vec(v0.x+(v1.x*s), 
			v0.y+(v1.y*s));
}

Vec.scale = function(v0,s) {
	return new Vec(v0.x*s, v0.y*s);
}

Vec.dot = function(v0,v1) {
	return (v0.x*v1.x) + (v0.y*v1.y);
}

Vec.rot = function(v,deg) {
	var a = degToRad(deg);
	return new Vec((Math.cos(a)*v.x) - (Math.sin(a)*v.y),
			(Math.sin(a)*v.x) + (Math.cos(a)*v.y));
}

Vec.prototype.length = function() {
	var d = Vec.dot(this,this);
	return Math.sqrt(d);
}

Vec.normalize = function(v0) {
	var len = 1.0 / v0.length();
	if(len > 0.0) {
		return new Vec(v0.x*len, v0.y*len);
	}
	return v0.clone();
}

// Return the angle, in derees, between
// any two vectors.
Vec.angle = function(v0,v1) {
	var tn = Vec.normalize(v0);
	var vn = Vec.normalize(v1);
	var ac = Math.acos(clamp(Vec.dot(tn,vn),-1,1));
	var a = radToDeg(ac);

	return a;
}

Vec.dist = function(v0,v1) {
	var r = Vec.sub(v0,v1);
	return r.length();
}

Vec.IsNaN = function(v) {
	return isNaN(v.x) || isNaN(v.y);
}

function Line(vs,ve) {
	this.start = vs.clone();
	this.end = ve.clone();
	this.length = Vec.dist(vs,ve);
}

Line.intersect = function(l0,l1) {
	var p1 = l0.start;
	var p2 = l0.end;
	var p3 = l1.start;
	var p4 = l1.end;

	var den = ((p4.y-p3.y)*(p2.x-p1.x)) - ((p4.x-p3.x)*(p2.y-p1.y));

	// No intersection if lines are parallel.
	if(den == 0.0) {
		return false;
	}

	ua = ((p4.x-p3.x)*(p1.y-p3.y)) - ((p4.y-p3.y)*(p1.x-p3.x));
	ua /= den;

	ub = ((p2.x-p1.x)*(p1.y-p3.y)) - ((p2.y-p1.y)*(p1.x-p3.x));
	ub /= den;

	// Intersection if lines are the same.
	if(ua == 0.0 && ub == 0.0) {
		return true;
	}

	// Intersection if ua and ub both lie on
	// the lines (they are in the range [0,1]).
	return ua >= 0.0 && ua <= 1.0 &&
		ub >= 0.0 && ub <= 1.0;
}


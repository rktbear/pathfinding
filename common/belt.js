op = {
	"<": function(a,b) { return a < b; },
	">": function(a,b) { return a > b; },
	"+": function(a,b) { return a + b; },
	"-": function(a,b) { return a - b; },
	"*": function(a,b) { return a * b; },
	"/": function(a,b) { return a / b; },
};

// Returns the position on the canvas from a mousedown event.
function canvasPos(event,canvas) {
	return new Vec(event.pageX - canvas.offsetLeft,
			event.pageY - canvas.offsetTop);
}

function repeat(c,count) {
	var l = [];
	for(var i=0; i<count; i++) {
		l.push(c);
	}
	return l;
}

function find(list,func) {
	for(var i=0; i<list.length; i++) {
		if(func(list[i])) {
			return list[i];
		}
	}
	return undefined;
}

// Return the larger of 'v' and 'm'.
function max(v,m) {
	return v > m ? v : m;
}

// Return the smaller of 'v' and 'm'.
function min(v,m) {
	return v < m ? v : m;
}

// Clamp the number 'v' to the range [start,end].
function clamp(v,start,end) {
	return max(min(v,end),start);
}

// 
function fold(list,start,func) {
	var f = start;
	for(var i=0; i<list.length; i++) {
		f = func(f,list[i]);
	}
	return f;
}

// Call the function 'func' on each value of 'list'.
function forEach(list,func) {
	for(var i=0; i<list.length; i++) {
		func(list[i]);
	}
}

function filter(list,func) {
	var r = [];
	for(var i=0; i<list.length; i++) {
		func(list[i]) && r.push(list[i]);
	}
	return r;
}

function map(list,func) {
	var r = [];
	for(var i=0; i<list.length; i++) {
		r.push(func(list[i]));
	}
	return r;
}

function and(list,func) {
	for(var i=0; i<list.length; i++) {
		if(func(list[i]) == false) {
			return false;
		}
	}
	return true;
}

function bind(object,func) {
	return function() {
		return func.apply(object,arguments);
	}
}

function asArray(array,start) {
	var result = [];
	for(var i=(start || 0); i<array.length; i++) {
		result.push(array[i]);
	}
	return result;
}

function curry(func) {
	var args = asArray(arguments,1);
	return function() {
		return func.apply(null, 
				args.concat(asArray(arguments)));
	}
}

function neg(func) {
	var args = asArray(arguments,1);
	return function() {
		return !func.apply(null,arguments);
	}
}

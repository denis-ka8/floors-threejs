import Vec from './vec.js';

class Vec2 extends Vec {

	constructor(x = 0, y = 0) {
		super(2);
		this[0] = x;
		this[1] = y;
	}

	get x() { return this[0]; }
	get y() { return this[1]; }

	set x(value) { this[0] = value; }
	set y(value) { this[1] = value; }

	// TODO: add methods for vector operations (add, subtract, dot product, etc.)
}

function vec2(x = 0, y = 0) {
	return new Vec2(x, y);
}

export { vec2 };
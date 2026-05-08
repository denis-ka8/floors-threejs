import Vec from './vec.js';

// rename to perimeter?
class Rect extends Vec {

	constructor(top = 0, right = 0, bottom = 0, left = 0) {
		super(4);
		this[0] = top;
		this[1] = right;
		this[2] = bottom;
		this[3] = left;
	}

	get top() { return this[0]; }
	get right() { return this[1]; }
	get bottom() { return this[2]; }
	get left() { return this[3]; }

	set top(value) { this[0] = value; }
	set right(value) { this[1] = value; }
	set bottom(value) { this[2] = value; }
	set left(value) { this[3] = value; }

	get width() {
		return this[1] - this[3];
	}
	get height() {
		return this[2] - this[0];
	}

	copy() {
		return new Rect(this[0], this[1], this[2], this[3]);
	}
}

function rect(top = 0, right = 0, bottom = 0, left = 0) {
	return new Rect(top, right, bottom, left);
}

export { rect };
import Vec from "./vec";

class Vec3 extends Vec {

	constructor(x = 0, y = 0, z = 0) {
		super(3);
		this[0] = x;
		this[1] = y;
		this[2] = z;
	}

	get x() { return this[0]; }
	get y() { return this[1]; }
	get z() { return this[2]; }

	set x(value) { this[0] = value; }
	set y(value) { this[1] = value; }
	set z(value) { this[2] = value; }

	static normalize(v) {
		const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
		if (length === 0) return new Vec3(0, 0, 0);
		return new Vec3(v.x / length, v.y / length, v.z / length);
	}

	static subtract(a, b) {
		return new Vec3(a.x - b.x, a.y - b.y, a.z - b.z);
	}

	static cross(a, b) {
		return new Vec3(
			a.y * b.z - a.z * b.y,
			a.z * b.x - a.x * b.z,
			a.x * b.y - a.y * b.x
		);
	}

	copy() {
		return new Vec3(this.x, this.y, this.z);
	}

	add(v) {
		return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
	}

	scale(value) {
		return new Vec3(this.x * value, this.y * value, this.z * value);
	}

	dot(v) {
		return this.x * v.x + this.y * v.y + this.z * v.z;
	}

	// TODO: add methods for vector operations (add, subtract, dot product, cross product, etc.)
}

function vec3(x = 0, y = 0, z = 0) {
	return new Vec3(x, y, z);
}

export { Vec3, vec3 };
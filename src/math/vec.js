class Vec extends Float32Array {

	constructor(sizeOrArray = 0) {
		if (Array.isArray(sizeOrArray) || sizeOrArray instanceof Float32Array) {
			super(sizeOrArray);
		} else {
			super(sizeOrArray);
			this.fill(0);
		}
	}
}

export default Vec;
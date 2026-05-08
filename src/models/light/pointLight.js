import Light from './light';

class PointLight extends Light {
	constructor(options = {}) {
		super(options);
		this._position = vec3();
		this._distance = options.distance !== undefined ? options.distance : 10.0;
		this._type = Light.Types.Point;
	}

	get position() { return this._position; }
	set position(v) {
		this._position = v;
		// this.trigger('modelUpdated', "position", v);
	}

	get distance() { return this._distance; }
	set distance(value) {
		this._distance = value;
		// this.trigger('modelUpdated', "distance", value);
	}
}

export default PointLight;
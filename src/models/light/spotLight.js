import PointLight from "./pointLight";
import Color from "../../utils/color";
import { vec3 } from "../../math/vec3";

class SpotLight extends PointLight {
	constructor(options = {}) {
		super(options);
		this._position = vec3();
		this._distance = options.distance !== undefined ? options.distance : 10.0;
		this._angle = options.angle !== undefined ? options.angle : 45; // угол конуса света в градусах
		this._penumbra = options.penumbra !== undefined ? options.penumbra : 0.1; // степень размытия тени
		this._type = Light.Types.Spot;
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

	get angle() { return this._angle; }
	set angle(value) {
		this._angle = value;
		// this.trigger('modelUpdated', "angle", value);
	}

	get penumbra() { return this._penumbra; }
	set penumbra(value) {
		this._penumbra = value;
		// this.trigger('modelUpdated', "penumbra", value);
	}
}

export default SpotLight;
import Light from "./light";
import { vec3 } from "../../math/vec3";

class DirectionalLight extends Light {
	constructor(options = {}) {
		super(options);
		this._position = options.position || vec3();
		this._direction = options.direction || vec3(0, -1, 0);
		this._type = Light.Types.Directional;
	}

	get position() { return this._position; }
	set position(v) {
		this._position = v;
		// this.trigger('modelUpdated', "position", v);
	}

	get direction() { return this._direction; }
	set direction(v) {
		this._direction = v;
		// this.trigger('modelUpdated', "direction", v);
	}
}

export default DirectionalLight;
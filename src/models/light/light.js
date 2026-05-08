import { vec3 } from "../../math/vec3";
import Color from "../../utils/color";
import BaseModel from "../model";

const TYPES = {
	Ambient: 'ambient',
	Directional: 'directional',
	Point: 'point',
	Spot: 'spot'
};

/**
 * Abstract class for light model
 */
class Light extends BaseModel {
	constructor(options = {}) {
		super(options);
		// TODO: use THREE.Color
		this._color = options.color || Color.white();
		this._intensity = options.intensity !== undefined ? options.intensity : 1.0;
		this._type = null;
	}

	get type() { return this._type; }

	get color() { return this._color; }
	set color(value) {
		this._color = value;
		// this.trigger('modelUpdated', "color", value);
	}

	get intensity() { return this._intensity; }
	set intensity(value) {
		this._intensity = value;
		// this.trigger('modelUpdated', "intensity", value);
	}

	static get Types() { return TYPES; }
}

export default Light;
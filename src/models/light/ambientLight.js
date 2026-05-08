import Light from "./light";

class AmbientLight extends Light {
	constructor(options = {}) {
		super(options);
		this._type = Light.Types.Ambient;
	}
}

export default AmbientLight;
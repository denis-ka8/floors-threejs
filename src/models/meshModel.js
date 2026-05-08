import { vec3 } from "../math/vec3"
import BaseModel from "./model"

class MeshModel extends BaseModel {

	_position = vec3();
	_rotation = vec3();

	constructor(options={}) {
		super(options);

		this._position = options.position || vec3();
		this._rotation = options.rotation || vec3();
	}

	get position() { return this._position; }
	set position(value) { this._position = value; }

	get rotation() { return this._rotation; }
	set rotation(value) { this._rotation = value; }
}

export default MeshModel;
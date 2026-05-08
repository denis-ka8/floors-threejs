import { m4 } from "../../math/m4"; // TODO: remove
import { vec3 } from "../../math/vec3";
import MathConverter from "../../math/converter";
import BaseModel from "../model";

class CameraModel extends BaseModel {

	_position = vec3(1, 1, 1);
	_target = vec3(0, 0, 0);
	_fov = 60;
	_aspect = 1;
	_near = 0.1;
	_far = 10000;
	_xAngle = 0;
	_yAngle = 0;
	_xAngleRad = 0;
	_yAngleRad = 0;

	constructor(options = {}) {
		super(options);
		this._position = options.position || this._position;
		this._target = options.target || this._target;
		this._fov = options.fov || this._fov;
		this._aspect = options.aspect || this._aspect;
		this._near = options.near || this._near;
		this._far = options.far || this._far;
		// TODO: calc angles from position and target
		this._xAngle = options.xAngle || this._xAngle;
		this._yAngle = options.yAngle || this._yAngle;
		this._xAngleRad = MathConverter.degreesToRadians(this._xAngle);
		this._yAngleRad = MathConverter.degreesToRadians(this._yAngle);
	}

	get position() { return this._position; }
	set position(value) {
		this._position = value;
	}

	get target() { return this._target; }
	set target(value) {
		this._target = value;
	}

	get fov() { return this._fov; }
	set fov(value) {
		this._fov = value;
	}

	get aspect() { return this._aspect; }
	set aspect(value) {
		this._aspect = value;
	}

	get near() { return this._near; }
	set near(value) {
		this._near = value;
	}

	get far() { return this._far; }
	set far(value) {
		this._far = value;
	}

	get xAngle() { return this._xAngle; }
	set xAngle(value) {
		this._xAngle = this._normalizeAngle(value);
		this._xAngleRad = MathConverter.degreesToRadians(this._xAngle);
	}

	get yAngle() { return this._yAngle; }
	set yAngle(value) {
		this._yAngle = Math.max(-89, Math.min(89, this._normalizeAngle(value)));
		this._yAngleRad = MathConverter.degreesToRadians(this._yAngle);
	}

	getViewMatrix() {
		const forward = this.getForwardVector();
		const right = this.getRightVector();
		const up = this.getUpVector();

		const x = -right.dot(this._position);
		const y = -up.dot(this._position);
		const z = -forward.dot(this._position);

		return [
			right.x, up.x, forward.x, 0,
			right.y, up.y, forward.y, 0,
			right.z, up.z, forward.z, 0,
			x,       y,    z,         1
		];
	}

	getProjectionMatrix() {
		const f = 1 / Math.tan(this._fov * Math.PI / 360);
		const nf = 1 / (this._near - this._far);

		return [
			f / this._aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (this._far + this._near) * nf, -1,
			0, 0, (2 * this._far * this._near) * nf, 0
		];
	}

	getViewProjectionMatrix() {
		return m4.multiply(this.getProjectionMatrix(), this.getViewMatrix());
	}

	getForwardVector() {
		const cosX = Math.cos(this._xAngleRad);
		const sinX = Math.sin(this._xAngleRad);
		const cosY = Math.cos(this._yAngleRad);
		const sinY = Math.sin(this._yAngleRad);

		return vec3(
			sinX * cosY,
			-sinY,
			cosX * cosY
		);
	}

	getRightVector() {
		const cosX = Math.cos(this._xAngleRad);
		const sinX = Math.sin(this._xAngleRad);

		return vec3(
			cosX,
			0,
			-sinX
		);
	}

	getUpVector() {
		const cosX = Math.cos(this._xAngleRad);
		const sinX = Math.sin(this._xAngleRad);
		const cosY = Math.cos(this._yAngleRad);
		const sinY = Math.sin(this._yAngleRad);

		return vec3(
			sinX * sinY,
			cosY,
			cosX * sinY
		);
	}

	_normalizeAngle(angle) {
		angle = angle % 360;
		if (angle < -180) angle += 360;
		if (angle > 180) angle -= 360;
		return angle;
	}
}

export default CameraModel;
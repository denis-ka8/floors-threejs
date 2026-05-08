import BaseModel from "../models/model"

class SceneModel extends BaseModel {

	constructor(options={}) {
		super(options);

		// Map of modelIdCounter to model instance
		this._objects = new Map();
		this._lights = new Map();
		this._cameras = new Map();
	}

	// Objects
	addObject(object) {
		if (this._objects.has(object.id)) {
			console.warn(`Object with id ${object.id} already exists in the scene model. It will be overwritten.`);
		}
		this._objects.set(object.id, object);
		this.trigger('objectAdded', object);
	}

	getObject(id) {
		return this._objects.get(id);
	}

	removeObject(id) {
		this._objects.delete(id);
		this.trigger('objectRemoved', id);
	}

	// Lights
	addLight(light) {
		if (this._lights.has(light.id)) {
			console.warn(`Light with id ${light.id} already exists in the scene model. It will be overwritten.`);
		}
		this._lights.set(light.id, light);
		this.trigger('lightAdded', light);
	}

	getLight(id) {
		return this._lights.get(id);
	}

	getLights() {
		return Array.from(this._lights.values());
	}

	removeLight(id) {
		this._lights.delete(id);
		this.trigger('lightRemoved', id);
	}

	// Cameras
	addCamera(camera) {
		if (this._cameras.has(camera.id)) {
			console.warn(`Camera with id ${camera.id} already exists in the scene model. It will be overwritten.`);
		}
		this._cameras.set(camera.id, camera);
		this.trigger('cameraAdded', camera);
	}

	getCamera(id) {
		return this._cameras.get(id);
	}

	removeCamera(id) {
		this._cameras.delete(id);
		this.trigger('cameraRemoved', id);
	}
}

export default SceneModel;
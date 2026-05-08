import EventEmitter from "../utils/eventEmitter"

let modelIdCounter = 0;

/**
 * BaseModel is a base class for all models in the application.
 * It provides basic functionality for tracking changes and applying them to the model.
 */
class BaseModel extends EventEmitter {
	constructor(options={}) {
		super();
		this._id = modelIdCounter++;
		this._dirty = {};
	}

	get id() { return this._id; }

	save() {
		// TODO: save changes as dirty
	}

	apply() {
		// TODO:
		// apply changes to the model, clear dirty flags
		// trigger model changed event, update views
		const updates = {};
		for (const [key, value] of Object.entries(this._dirty)) {
			updates[key] = {
				old: this[key],
				new: this._dirty[key],
			};
			this[`_${key}`] = this._dirty[key];
		}
		this._dirty = {};

		this.trigger('modelUpdated', this, updates);
	}
}

export default BaseModel;
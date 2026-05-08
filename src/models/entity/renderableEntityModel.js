import EntityModel from "./entityModel";
import { vec3 } from "../../math/vec3";

class RenderableEntityModel extends EntityModel {
    constructor(options={}) {
        super(options);

		this._position = options.position || vec3();
		this._rotation = options.rotation || vec3();

        this._renderableModels = [];
    }

	get position() { return this._position; }
	set position(value) { this._position = value; }

	get rotation() { return this._rotation; }
	set rotation(value) { this._rotation = value; }

    // Method must be realized in the subclass
    _createRenderableModels() {}

    _addToRenderableModel(model) {
        model.on("modelUpdated", this._onModelUpdated.bind(this));
        this._renderableModels.push(model);
    }

    getRenderableModels() {
        return this._renderableModels;
    }

    _onModelUpdated(model, changes) {
        this.trigger("modelUpdated", model, changes);
    }

	apply() {
        for (const renderableModel of this._renderableModels) {
            renderableModel.apply();
        }
        super.apply();
	}
}

export default RenderableEntityModel;

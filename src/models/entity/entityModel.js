import BaseModel from "../model";

/**
 * Base class for high‑level entities in the 3D scene.
 * Entities are composed of primitive WebGL components
 * and represent business logic objects
 */
class EntityModel extends BaseModel {
    constructor(options={}) {
        super(options);
    }
}

export default EntityModel;
import MeshModel from "./meshModel";

class BoxModel extends MeshModel {
    constructor(options={}) {
        super(options);
        this._width = options.width ?? 1;
        this._height = options.height ?? 1;
        this._depth = options.depth ?? 1;
        this._color = options.color || "gray";
    }

    get width() { return this._width; }
    set width(value) { this._width = value; }

    get height() { return this._height; }
    set height(value) {
        // this._height = value;
        this._dirty.height = value;
    }

    get depth() { return this._depth; }
    set depth(value) { this._depth = value; }

    get color() { return this._color; }
    set color(value) { this._color = value; }
}

export default BoxModel;

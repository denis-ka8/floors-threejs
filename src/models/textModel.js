import MeshModel from "./meshModel";

class TextModel extends MeshModel {
    constructor(options={}) {
        super(options);
        this._text = options.text || "";
        this._fontSize = options.fontSize ?? 48;
        this._color = options.color || "white";
        this._backgroundColor = options.backgroundColor || "transparent";
        this._padding = options.padding ?? 10;
        this._width = options.width;
        this._depth = options.depth;
    }

    get text() { return this._text; }
    set text(value) { this._text = value; }

    get width() { return this._width; }
    set width(value) { this._width = value; }

    get depth() { return this._depth; }
    set depth(value) { this._depth = value; }

    get fontSize() { return this._fontSize; }
    set fontSize(value) { this._fontSize = value; }

    get color() { return this._color; }
    set color(value) { this._color = value; }

    get backgroundColor() { return this._backgroundColor; }
    set backgroundColor(value) { this._backgroundColor = value; }

    get padding() { return this._padding; }
    set padding(value) { this._padding = value; }
}

export default TextModel;

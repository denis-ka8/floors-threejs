import RenderableEntityModel from "./renderableEntityModel";
import * as THREE from "three";
import BoxModel from "../boxModel";
import TextModel from "../textModel";
import { vec3 } from "../../math/vec3";

class ShopModel extends RenderableEntityModel {
    constructor(options={}) {
        super(options);

        this._shopId = options.id;
        this._name = options.name || "";
        this._width = options.width ?? 1;
        this._depth = options.depth ?? 1;
        this._height = options.height ?? 1;
        this._color = options.color instanceof THREE.Color ? options.color : new THREE.Color(options.color || "gray");

        this._createRenderableModels();
    }

    _createRenderableModels() {
        this._boxModel = new BoxModel({
            width: this._width,
            depth: this._depth,
            height: this._height,
            color: this._color,
            position: this._position,
        });
        this._addToRenderableModel(this._boxModel);

        this._textModel = new TextModel({
            text: this._name,
            position: vec3(this._position.x, this._position.y + this._height * 1.2 + 0.01, this._position.z),
            width: this._width * 0.9,
            depth: this._depth * 0.9,
            color: this._getTextColor(),
            backgroundColor: "transparent"
        });
        this._addToRenderableModel(this._textModel);
    }

    _getTextColor() {
        const luminance = this._color.r * 0.2126 + this._color.g * 0.7152 + this._color.b * 0.0722;
        return luminance > 0.55 ? "#000000" : "#ffffff";
    }

    get shopId() { return this._shopId; }
    set shopId(value) { this._shopId = value; }

    get name() { return this._name; }
    set name(value) { this._name = value; }

    get width() { return this._width; }
    set width(value) { this._width = value; }

    get depth() { return this._depth; }
    set depth(value) { this._depth = value; }

    get height() { return this._height; }
    set height(value) {
        debugger
        this._height = value;
        this._boxModel.height = value;
    }

    get color() { return this._color; }
    set color(value) { this._color = value; }
}

export default ShopModel;

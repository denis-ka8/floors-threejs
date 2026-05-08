import * as THREE from "three";
import MeshModel from "./meshModel";

const SIDE = {
    FrontSide: THREE.FrontSide,
    BackSide: THREE.BackSide,
    DoubleSide: THREE.DoubleSide,
}

class PlaneModel extends MeshModel {

    constructor(options={}) {
        super(options);
        this._width = options.width !== undefined ? options.width : 1;
        this._depth = options.depth !== undefined ? options.depth : 1;
        this._color = options.color || "gray";
        this._side = options.side || SIDE.FrontSide;
    }

	get width() { return this._width; }
	set width(value) { this._width = value; }

	get depth() { return this._depth; }
	set depth(value) { this._depth = value; }

	get color() { return this._color; }
	set color(value) { this._color = value; }

	get side() { return this._side; }
	set side(value) { this._side = value; }

    static get Side() { return SIDE; }
}

export default PlaneModel;
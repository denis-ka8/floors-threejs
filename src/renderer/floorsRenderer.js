import * as THREE from "three";

class FloorsRenderer {
    constructor() {
        this._webGLRenderer = null;
        this._init();
    }

    get webGLRenderer() {
        return this._webGLRenderer;
    }

    _init() {
		this._webGLRenderer = new THREE.WebGLRenderer();
		this._webGLRenderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this._webGLRenderer.domElement);
    }

    resize(width, height) {
        this._webGLRenderer.setSize(width, height);
    }

    render(scene, camera) {
        this._webGLRenderer.render(scene, camera);
    }
}

export default FloorsRenderer;
import * as THREE from "three";

class RaycastManager {
    constructor(camera) {
        this._camera = camera;
        this._raycaster = new THREE.Raycaster();
        this._mouse = new THREE.Vector2();
        this._hoveredBoxIndex = -1;
        this._raycastTarget = null;
    }

    setRaycastTarget(target) {
        this._raycastTarget = target;
    }

    raycast(clientX, clientY, width, height) {
        this._mouse.x = (clientX / width) * 2 - 1;
        this._mouse.y = -(clientY / height) * 2 + 1;

        this._raycaster.setFromCamera(this._mouse, this._camera);

        if (!this._raycastTarget) {
            console.warn('RaycastManager: Raycast target not set');
            return [];
        }

        return this._raycaster.intersectObject(this._raycastTarget, true);
    }

    setHoveredBoxIndex(index) {
        this._hoveredBoxIndex = index;
    }

    getHoveredBoxIndex() {
        return this._hoveredBoxIndex;
    }
}

export default RaycastManager;

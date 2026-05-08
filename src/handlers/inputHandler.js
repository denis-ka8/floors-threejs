import * as THREE from "three";

class InputHandler {
    constructor(raycastManager, boxRenderer, boxModelToShop) {
        this._raycastManager = raycastManager;
        this._boxRenderer = boxRenderer;
        this._boxModelToShop = boxModelToShop;
        this._originalColors = new Map();
    }

    handleMouseMove(clientX, clientY, width, height) {
        const start = performance.now();

        const intersects = this._raycastManager.raycast(clientX, clientY, width, height);

        this._restorePreviousHover();

        if (intersects.length > 0) {
            const instanceId = intersects[0].instanceId;
            if (instanceId !== undefined) {
                this._raycastManager.setHoveredBoxIndex(instanceId);
                this._highlightBox(instanceId);
            }
        } else {
            this._raycastManager.setHoveredBoxIndex(-1);
        }
        const end = performance.now();
    }

    handleClick() {
        const hoveredIndex = this._raycastManager.getHoveredBoxIndex();
        if (hoveredIndex < 0) return;

        const boxModel = this._boxRenderer.getBoxModelByInstanceIndex(hoveredIndex);
        if (!boxModel) return;

        const shopModel = this._boxModelToShop.get(boxModel.id);
        if (shopModel) {
            console.log(shopModel.name, shopModel);
        }
    }

    _highlightBox(boxIndex) {
        const boxModel = this._boxRenderer.getBoxModelByInstanceIndex(boxIndex);
        if (!boxModel) return;

        if (!this._originalColors.has(boxIndex)) {
            this._originalColors.set(boxIndex, boxModel.color);
        }

        const originalColor = new THREE.Color(boxModel.color);
        const hsl = {};
        originalColor.getHSL(hsl);
        hsl.l = Math.min(1, hsl.l + 0.3);
        const brightColor = new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);

        this._boxRenderer.updateBoxColorByIndex(boxIndex, brightColor);
    }

    _restorePreviousHover() {
        const prevIndex = this._raycastManager.getHoveredBoxIndex();
        if (prevIndex >= 0) {
            const originalColor = this._originalColors.get(prevIndex);
            if (originalColor) {
                this._boxRenderer.updateBoxColorByIndex(prevIndex, originalColor);
                this._originalColors.delete(prevIndex);
            }
        }
    }
}

export default InputHandler;

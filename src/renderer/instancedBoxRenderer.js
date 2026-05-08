import * as THREE from "three";

class InstancedBoxRenderer {

	constructor(maxInstances = 10000) {
		this._maxInstances = maxInstances;
		this._instanceCount = 0;
		this._modelIndexMap = new Map(); // Map of modelId to instanceIndex
		this._indexModelMap = new Map(); // Map of instanceIndex to boxModel
		
		this._initGeometryAndMaterial();
		this._createInstancedMesh();
	}

	_initGeometryAndMaterial() {
		this._geometry = new THREE.BoxGeometry(1, 1, 1);
		this._material = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			metalness: 0.1,
			roughness: 0.8
		});
	}

	_createInstancedMesh() {
		this._instancedMesh = new THREE.InstancedMesh(
			this._geometry,
			this._material,
			this._maxInstances
		);
		this._instancedMesh.castShadow = true;
		this._instancedMesh.receiveShadow = true;
	}

	addBoxModel(boxModel) {
		if (this._instanceCount >= this._maxInstances) {
			console.warn(`InstancedBoxRenderer: Maximum instance count (${this._maxInstances}) reached`);
			return -1;
		}

		const instanceIndex = this._instanceCount;
		this._modelIndexMap.set(boxModel.id, instanceIndex);
		this._indexModelMap.set(instanceIndex, boxModel);

		const dummy = new THREE.Object3D();
		dummy.position.copy(boxModel.position);
		dummy.scale.set(boxModel.width, boxModel.height, boxModel.depth);

		dummy.updateMatrix();
		this._instancedMesh.setMatrixAt(instanceIndex, dummy.matrix);

		const color = this._parseColor(boxModel.color);
		this._instancedMesh.setColorAt(instanceIndex, color);

		this._instanceCount++;

		return instanceIndex;
	}

	updateBoxModel(boxModel) {
		const instanceIndex = this._modelIndexMap.get(boxModel.id);
		if (instanceIndex === undefined) return;

		const dummy = new THREE.Object3D();
		
		dummy.position.copy(boxModel.position);
		dummy.scale.set(boxModel.width, boxModel.height, boxModel.depth);
		
		dummy.updateMatrix();
		this._instancedMesh.setMatrixAt(instanceIndex, dummy.matrix);

		const color = this._parseColor(boxModel.color);
		this._instancedMesh.setColorAt(instanceIndex, color);

		this._instancedMesh.instanceMatrix.needsUpdate = true;
		if (this._instancedMesh.instanceColor) {
			this._instancedMesh.instanceColor.needsUpdate = true;
		}
	}

	updateBoxHeight(boxModel) {
		this.updateBoxModel(boxModel);
	}

	updateBoxColorByIndex(instanceIndex, color) {
		const threeColor = this._parseColor(color);
		this._instancedMesh.setColorAt(instanceIndex, threeColor);
		if (this._instancedMesh.instanceColor) {
			this._instancedMesh.instanceColor.needsUpdate = true;
		}
	}

	getBoxModelByInstanceIndex(instanceIndex) {
		return this._indexModelMap.get(instanceIndex);
	}

	getInstanceIndexByBoxModelId(modelId) {
		return this._modelIndexMap.get(modelId);
	}

	removeBoxModel(modelId) {
		this._modelIndexMap.delete(modelId);
		// TODO: reorganize instances
	}

	getInstancedMesh() {
		return this._instancedMesh;
	}

	finalize() {
		// Set the count to only render added instances, not all max instances
		this._instancedMesh.count = this._instanceCount;
		
		if (this._instancedMesh.instanceMatrix) {
			this._instancedMesh.instanceMatrix.needsUpdate = true;
		}
		if (this._instancedMesh.instanceColor) {
			this._instancedMesh.instanceColor.needsUpdate = true;
		}
	}

	getInstanceCount() {
		return this._instanceCount;
	}

	_parseColor(color) {
		if (color instanceof THREE.Color) {
			return color;
		}
		return new THREE.Color(color);
	}

	dispose() {
		this._geometry.dispose();
		this._material.dispose();
		this._instancedMesh.dispose();
		this._modelIndexMap.clear();
	}
}

export default InstancedBoxRenderer;
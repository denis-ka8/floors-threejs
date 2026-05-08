import * as THREE from "three";

class TextBatchRenderer {

	constructor() {
		this._textMeshes = new Map(); // Map of modelId to mesh
		this._textModels = new Map(); // Map of modelId to model
		this._container = new THREE.Group();
		this._cameraDirection = new THREE.Vector3();
	}

	addTextModel(textModel) {
		if (this._textMeshes.has(textModel.id)) {
			console.warn(`TextBatchRenderer::addTextModel() Text model ${textModel.id} already exists`);
			return;
		}

		const mesh = this._createTextMesh(textModel);
		this._textMeshes.set(textModel.id, mesh);
		this._textModels.set(textModel.id, textModel);
		this._container.add(mesh);
	}

	updateTextModel(textModel) {
		const mesh = this._textMeshes.get(textModel.id);
		if (!mesh) return;

		mesh.position.copy(textModel.position);
		
		if (mesh.userData.text !== textModel.text) {
			this._updateTextMeshGeometry(mesh, textModel);
		}
	}

	removeTextModel(modelId) {
		const mesh = this._textMeshes.get(modelId);
		if (mesh) {
			this._container.remove(mesh);
			mesh.geometry.dispose();
			mesh.material.dispose();
			this._textMeshes.delete(modelId);
			this._textModels.delete(modelId);
		}
	}

	getContainer() {
		return this._container;
	}

	updateOrientation(camera, viewMode) {
		if (!camera) return;

		const MODE_2D = "Mode2D";

		const cameraDir = camera.position.clone();
		cameraDir.y = 0;
		if (cameraDir.lengthSq() < 1e-6) {
			cameraDir.set(0, 0, 1);
		}
		cameraDir.normalize();
		const textYaw = Math.atan2(cameraDir.x, cameraDir.z);

		for (const [modelId, mesh] of this._textMeshes) {
			if (viewMode === MODE_2D) {
				mesh.rotation.set(-Math.PI / 2, 0, 0);
				mesh.scale.set(1, 1, 1);
			} else {
				mesh.rotation.set(0, textYaw, 0);
				const baseHeight = mesh.userData.baseHeight || 1;
				const uniformScale = 3 / baseHeight;
				mesh.scale.set(uniformScale, uniformScale, 1);
			}
		}
	}

	_createTextMesh(textModel) {
		const { canvas, width: rawWidth, height: rawHeight } = this._createTextCanvas(
			textModel.text,
			textModel.fontSize,
			textModel.backgroundColor
		);

		const texture = new THREE.CanvasTexture(canvas);
		texture.needsUpdate = true;
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.generateMipmaps = false;

		const planeWidth = textModel.width ?? Math.max(1, rawWidth * 0.02);
		const planeHeight = rawHeight * (planeWidth / rawWidth);
		const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true,
			side: THREE.DoubleSide,
			depthWrite: false,
		});

		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.copy(textModel.position);
		mesh.userData.isText = true;
		mesh.userData.textModel = textModel;
		mesh.userData.baseHeight = planeHeight;
		mesh.userData.text = textModel.text;

		return mesh;
	}

	_updateTextMeshGeometry(mesh, textModel) {
		const { canvas, width: rawWidth, height: rawHeight } = this._createTextCanvas(
			textModel.text,
			textModel.fontSize,
			textModel.backgroundColor
		);

		const texture = new THREE.CanvasTexture(canvas);
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.generateMipmaps = false;

		mesh.material.map = texture;
		mesh.userData.text = textModel.text;

		const planeWidth = textModel.width ?? Math.max(1, rawWidth * 0.02);
		const planeHeight = rawHeight * (planeWidth / rawWidth);

		if (Math.abs(mesh.userData.baseHeight - planeHeight) > 0.01) {
			mesh.geometry.dispose();
			const newGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
			mesh.geometry = newGeometry;
			mesh.userData.baseHeight = planeHeight;
		}
	}

	_createTextCanvas(text, fontSize, backgroundColor = 'transparent') {
		const padding = Math.ceil(fontSize * 0.5);
		const font = `bold ${fontSize}px Arial`;

		const measureCanvas = document.createElement('canvas');
		const measureContext = measureCanvas.getContext('2d');
		measureContext.font = font;
		const textMetrics = measureContext.measureText(text);
		const textWidth = Math.ceil(textMetrics.width);
		const textHeight = Math.ceil(fontSize * 1.2);

		const rawWidth = textWidth + padding * 2;
		const rawHeight = textHeight + padding * 2;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);

		const canvas = document.createElement('canvas');
		canvas.width = rawWidth * dpr;
		canvas.height = rawHeight * dpr;
		const context = canvas.getContext('2d');
		context.setTransform(dpr, 0, 0, dpr, 0, 0);

		context.font = font;
		context.textBaseline = 'middle';
		context.textAlign = 'center';
		context.fillStyle = 'white';
		context.strokeStyle = 'rgba(0, 0, 0, 0.65)';
		context.lineWidth = Math.max(2, fontSize * 0.08);

		if (backgroundColor !== 'transparent') {
			context.fillStyle = backgroundColor;
			context.fillRect(0, 0, rawWidth, rawHeight);
			context.fillStyle = 'white';
		}

		context.strokeText(text, rawWidth / 2, rawHeight / 2);
		context.fillText(text, rawWidth / 2, rawHeight / 2);

		return { canvas, width: rawWidth, height: rawHeight };
	}

	dispose() {
		for (const mesh of this._textMeshes.values()) {
			mesh.geometry.dispose();
			mesh.material.dispose();
		}
		this._textMeshes.clear();
		this._textModels.clear();
	}
}

export default TextBatchRenderer;
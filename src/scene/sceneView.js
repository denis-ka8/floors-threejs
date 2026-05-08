import EventEmitter from "../utils/eventEmitter";
import Color from "../utils/color";

import * as THREE from "three";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from 'three/addons/libs/stats.module.js';

import FloorsRenderer from "../renderer/floorsRenderer";
import InstancedBoxRenderer from "../renderer/instancedBoxRenderer";
import TextBatchRenderer from "../renderer/textBatchRenderer";
import CameraController from "../controllers/cameraController";

const VIEW_MODE = {
	Mode2D: "Mode2D",
	Mode3D: "Mode3D"
};

class SceneView extends EventEmitter {

	constructor(sceneModel, renderer) {
		super();

		this._viewMode = VIEW_MODE.Mode3D;
		this._drawableObjects = new Map(); // Map of modelId to drawable object
		this._shopModels = [];
		this._boxModelToShop = new Map(); // Map of boxModel.id to shopModel

		this._sceneModel = sceneModel;
		
		this._scene = new THREE.Scene();
		this._renderer = new FloorsRenderer();
		this._boxRenderer = new InstancedBoxRenderer();
		this._textRenderer = new TextBatchRenderer();

		// Raycast setup
		this._raycaster = new THREE.Raycaster();
		this._mouse = new THREE.Vector2();
		this._raycastContainer = new THREE.Group();
		this._scene.add(this._raycastContainer);
		this._hoveredBoxIndex = -1;
		
		this._sceneModel.on('cameraAdded', this._onCameraAdded.bind(this));
		this._sceneModel.on('lightAdded', this._onLightAdded.bind(this));
		this._sceneModel.on('objectAdded', this._onObjectAdded.bind(this));
		
		this._initEnvironment();
		this._initStats();
		this._initMouseListeners();

		this._onModeChanged = this._onModeChanged.bind(this);
	}

	_initEnvironment() {
		const pmrem = new THREE.PMREMGenerator(this._renderer.webGLRenderer);
		const hdrLoader = new HDRLoader();
		hdrLoader.load('./assets/rostock_laage_airport_4k.hdr', (texture) => {
			const envMap = pmrem.fromEquirectangular(texture).texture;
			
			this._scene.environmentIntensity = 0.05;
			this._scene.backgroundIntensity = 0.05;
			this._scene.backgroundBlurriness = 0.15;

			this._scene.environment = envMap;
			this._scene.background = envMap;
			texture.dispose();
			pmrem.dispose();
		});
	}

	_initStats() {
		this._stats = new Stats();
		this._stats.showPanel(0);
		document.body.appendChild(this._stats.dom);
	}

	_initMouseListeners() {
		window.addEventListener('mousemove', (event) => this._onMouseMove(event), false);
		window.addEventListener('click', (event) => this._onClick(event), false);
	}

	_onMouseMove(event) {
		// Calculate normalized mouse coordinates
		this._mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		this._mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		if (!this._camera) return;

		// Raycast
		this._raycaster.setFromCamera(this._mouse, this._camera);
		const intersects = this._raycaster.intersectObjects(this._raycastContainer.children);

		// Restore previous hovered box color
		if (this._hoveredBoxIndex >= 0) {
			const boxModel = this._boxRenderer.getBoxModelByInstanceIndex(this._hoveredBoxIndex);
			if (boxModel) {
				this._boxRenderer.updateBoxColorByIndex(this._hoveredBoxIndex, boxModel.color);
			}
		}

		this._hoveredBoxIndex = -1;

		// Check if hovering over a box
		if (intersects.length > 0) {
			const intersected = intersects[0].object;
			const boxIndex = intersected.userData.boxIndex;
			
			if (boxIndex !== undefined) {
				this._hoveredBoxIndex = boxIndex;
				// Increase color intensity on hover
				const boxModel = this._boxRenderer.getBoxModelByInstanceIndex(boxIndex);
				if (boxModel) {
					const originalColor = new THREE.Color(boxModel.color);
					
					// Increase brightness
					const hsl = {};
					originalColor.getHSL(hsl);
					hsl.l = Math.min(1, hsl.l + 0.3);
					const brightColor = new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
					this._boxRenderer.updateBoxColorByIndex(boxIndex, brightColor);
				}
			}
		}
	}

	_onClick(event) {
		if (this._hoveredBoxIndex < 0) return;

		const boxModel = this._boxRenderer.getBoxModelByInstanceIndex(this._hoveredBoxIndex);
		if (!boxModel) return;

		const shopModel = this._boxModelToShop.get(boxModel.id);
		if (shopModel) {
			console.log(shopModel.name, shopModel);
		}
	}

	initializeShopModels(shopModels) {
		this._shopModels = shopModels;

		let boxIndex = 0;
		for (const shop of shopModels) {
			for (const renderModel of shop.getRenderableModels()) {
				if (renderModel.constructor.name === "BoxModel") {
					this._boxRenderer.addBoxModel(renderModel);
					this._boxModelToShop.set(renderModel.id, shop);

					// Create invisible raycast box
					const raycastGeometry = new THREE.BoxGeometry(
						renderModel.width,
						renderModel.height,
						renderModel.depth
					);
					const raycastMaterial = new THREE.MeshBasicMaterial({
						transparent: true,
						opacity: 0,
						wireframe: false
					});
					const raycastMesh = new THREE.Mesh(raycastGeometry, raycastMaterial);
					raycastMesh.position.copy(renderModel.position);
					raycastMesh.userData.boxIndex = boxIndex++;
					raycastMesh.userData.boxModel = renderModel;
					this._raycastContainer.add(raycastMesh);

					renderModel.on("modelUpdated", (model, changes) => {
						if (changes.hasOwnProperty("height")) {
							this._boxRenderer.updateBoxHeight(renderModel);
							// Update raycast mesh height
							const foundRaycastMesh = this._raycastContainer.children.find(
								mesh => mesh.userData.boxModel === renderModel
							);
							if (foundRaycastMesh) {
								foundRaycastMesh.scale.y = renderModel.height;
								foundRaycastMesh.position.y = renderModel.position.y;
							}
							this._updateRelatedTextPosition(shop);
						}
					});
				} else if (renderModel.constructor.name === "TextModel") {
					this._textRenderer.addTextModel(renderModel);
				}
			}
		}

		this._boxRenderer.finalize();
		this._scene.add(this._boxRenderer.getInstancedMesh());
		this._scene.add(this._textRenderer.getContainer());
	}

	_updateRelatedTextPosition(shop) {
		const textModel = shop._textModel;
		if (!textModel) return;

		textModel.position.y = shop.position.y + shop.height * 1.2 + 0.01;
		this._textRenderer.updateTextModel(textModel);
	}

	changeMode() {
		if (!this._cameraController) return;

		if (this._viewMode === VIEW_MODE.Mode3D) {
			this._viewMode = VIEW_MODE.Mode2D;

			this._cameraController.enableControls(false);
			this._cameraController.animateCameraTransitionToUp(true);
		} else {
			this._viewMode = VIEW_MODE.Mode3D;
			this._cameraController.animateCameraTransitionToUp(false);
		}
	}

	_onModeChanged() {
		this.trigger("modeChanged", this._viewMode)
	}

	_onObjectAdded(objectModel) {
		if (objectModel.constructor.name === "PlaneModel") {
			const drawable = this._createPlane(objectModel);
			this._scene.add(drawable);
			this._drawableObjects.set(objectModel.id, drawable);
		}
	}

	_onCameraAdded(cameraModel) {
		// only one, for now
		if (this._camera) return;

		this._camera = new THREE.PerspectiveCamera(
			cameraModel.fov,
			cameraModel.aspect,
			cameraModel.near,
			cameraModel.far
		);
		this._camera.position.x = cameraModel.position.x;
		this._camera.position.y = cameraModel.position.y;
		this._camera.position.z = cameraModel.position.z;

		this._cameraController = new CameraController(this._camera, this._renderer.webGLRenderer.domElement);
		this._cameraController.on("animationComplete", this._onModeChanged);
	}

	_onLightAdded(lightModel) {
		let light = null;
		switch (lightModel.constructor.name) {
			case "AmbientLight":
				light = new THREE.AmbientLight(lightModel.color, lightModel.intensity);
				break;
			case "DirectionalLight":
				light = new THREE.DirectionalLight(lightModel.color, lightModel.intensity);
				light.position.set(lightModel.position.x, lightModel.position.y, lightModel.position.z);
				light.target.position.set(lightModel.direction.x, lightModel.direction.y, lightModel.direction.z);
				this._scene.add(light.target);
				// this._helper = new THREE.DirectionalLightHelper(light, 5);
				// this._scene.add(this._helper);
				break;
			default:
				console.warn(`Unknown light model type ${lightModel.constructor.name} added to the scene model. It will not be rendered.`);
				return null;
		}

		this._scene.add(light);
	}

	_createPlane(model) {
		const planeGeometry = new THREE.PlaneGeometry(model.width, model.depth);
		const planeMaterial = new THREE.MeshBasicMaterial({
			color: model.color,
			side: model.side
		});
		const plane = new THREE.Mesh(planeGeometry, planeMaterial);

		plane.rotation.x = model.rotation.x;
		plane.rotation.y = model.rotation.y;
		plane.rotation.z = model.rotation.z;

		plane.position.x = model.position.x;
		plane.position.y = model.position.y;
		plane.position.z = model.position.z;

		return plane;
	}

	update() {
		this._cameraController.update();

		this._textRenderer.updateOrientation(this._camera, this._viewMode);

		this._stats.update();
		this._renderer.render(this._scene, this._camera);
	}

	resize() {
		this._camera.aspect = window.innerWidth / window.innerHeight;
		this._camera.updateProjectionMatrix();

		this._renderer.resize(window.innerWidth, window.innerHeight);
	}

	static get ViewMode() { return VIEW_MODE; }
}

export default SceneView;
import * as THREE from "three";

import SceneModel from "./sceneModel";
import SceneView from "./sceneView";
import SceneRepository from "../api/sceneRepository";
import { FLOOR } from "../config";

import ShopModel from "../models/entity/shopModel";
import DirectionalLight from "../models/light/directionalLight";
import CameraModel from "../models/camera/camera";
import AmbientLight from "../models/light/ambientLight";
import PlaneModel from "../models/planeModel";

import { positioningBoxes, positioningOther } from "../utils/positioning";

import Color from "../utils/color";
import { vec3 } from "../math/vec3";
import { rect } from "../math/rect";

/**
 * SceneManager is responsible for managing the scene,
 * including the scene model, view, and renderer.
 * It provides methods to initialize the scene, start and stop
 * the rendering loop, and handle resizing of the canvas.
 */
class SceneManager {

	constructor() {
		this._isRunning = false;
		this._shopModels = [];
		
		this._initialize();

		this._sceneRepository = new SceneRepository();
		this._fetchData();

		window.addEventListener('resize', this.resize.bind(this), false);
		document.addEventListener('keydown', (event) => {
			if (event.code === "Space")
				this._sceneView.changeMode();
		});
	}

	// Initialization
	_initialize() {
		this._sceneModel = new SceneModel();

		this._sceneView = new SceneView(this._sceneModel);
		this._sceneView.on("modeChanged", this._changeViewMode.bind(this));

		this._initCamera();

		this._initLighting();
		this._createPlane();
	}

	_initCamera() {
		const cameraModel = new CameraModel({
			fov: 75,
			aspect: window.innerWidth / window.innerHeight,
			near: 0.1,
			far: 5000,
			position: vec3(0, 40, 100)
		});
		this._sceneModel.addCamera(cameraModel);
	}

	_initLighting() {
		const ambientLight = new AmbientLight({
			color: new THREE.Color("white"),
			intensity: 0.5
		})
		this._sceneModel.addLight(ambientLight);

		const dirLight = new DirectionalLight({
			color: new THREE.Color("white"),
			intensity: 1,
			position: vec3(50, 50, 50)
		});
		this._sceneModel.addLight(dirLight);
	}
	// /Initialization

	// Control and update
	start() {
		this._isRunning = true;
		this._renderLoop();
	}

	stop() {
		this._isRunning = false;
	}

	_renderLoop() {
		if (!this._isRunning) return;

		requestAnimationFrame(() => this._renderLoop());
		this._sceneView.update();
	}

	resize() {
		this._sceneView.resize();
	}
	// /Control and update

	_createPlane() {
		this._planeModel = new PlaneModel({
			rotation: vec3(-Math.PI / 2, 0, 0),
			width: FLOOR.width,
			depth: FLOOR.depth,
			color: 0x383838,
			side: PlaneModel.Side.DoubleSide
		});
		this._sceneModel.addObject(this._planeModel);
	}

	async _fetchData() {
		let data = await this._sceneRepository.fetchFloorModels();
		console.log('response', data);

		if (!data) return;

		positioningBoxes(data, FLOOR);
		positioningOther(data, FLOOR);

		// Create shop models
		for (const item of data) {
			const shop = new ShopModel({
				id: item.id,
				name: item.name,
				width: item.width,
				depth: item.depth,
				height: 2,
				color: item.color,
				position: item.position
			});

			this._shopModels.push(shop);
		}

		// Initialize rendering for all shop models at once
		this._sceneView.initializeShopModels(this._shopModels);
	}

	_changeViewMode(viewMode) {
		for (const model of this._shopModels) {
			model.height = viewMode === SceneView.ViewMode.Mode2D ? 0.1 : 2;
			model.apply();
		}
	}
}

export default SceneManager;
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import EventEmitter from "../utils/eventEmitter";

const ANIMATION_DURATION = 500;

class CameraController extends EventEmitter {

    constructor(camera, domElement) {
        super();
        this._camera = camera;
        this._domElement = domElement;

        this._initControls();
        this._setInitialState();

        this._onAnimationComplete = this._onAnimationComplete.bind(this);
    }

    _initControls() {
		const controls = new OrbitControls(this._camera, this._domElement);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;
		controls.screenSpacePanning = false;
		controls.minDistance = 2;
		controls.maxDistance = 1000;

		controls.enableKeys = true;
		controls.keyPanSpeed = 15.0;
		controls.keys = {
			LEFT: 'KeyA',
			UP: 'KeyW',
			RIGHT: 'KeyD',
			BOTTOM: 'KeyS'
		};
		controls.listenToKeyEvents(window);

        this._controls = controls;
    }

    _setInitialState() {
        this._initialState = {
			position: this._camera.position.clone(),
			quaternion: this._camera.quaternion.clone(),
			up: this._camera.up.clone(),
			target: this._controls.target.clone()
        };
    }

    enableControls(enable) {
        this._controls.enabled = enable;
    }

    update() {
		this._controls.update();
    }

    _calculateTargetQuaternion(targetPosition, targetLookAt, targetUp) {
        if (!this._tempCamera)
            this._tempCamera = new THREE.PerspectiveCamera();

        this._tempCamera.position.copy(targetPosition);
        this._tempCamera.up.copy(targetUp);
        this._tempCamera.lookAt(targetLookAt);
        return this._tempCamera.quaternion.clone()
    }

    _onAnimationComplete() {
        this.trigger("animationComplete");
    }

    animateCameraTransitionToUp(fixUp = false) {
        const camera = this._camera;
        const controls = this._controls;
        const onComplete = this._onAnimationComplete;

        const { targetPosition, targetLookAt, targetUp } = fixUp ? {
            targetPosition: new THREE.Vector3(0, 80, 0),
            targetLookAt: new THREE.Vector3(0, 0, 0),
            targetUp: new THREE.Vector3(0, 0, -1),
        } : {
            targetPosition: this._initialState.position.clone(),
            targetLookAt: this._initialState.target.clone(),
            targetUp: this._initialState.up.clone(),
        };

        const startPosition = camera.position.clone();
        const startQuaternion = camera.quaternion.clone();
        const startTarget = controls.target.clone();

        const targetQuaternion = this._calculateTargetQuaternion(targetPosition, targetLookAt, targetUp);

        this.enableControls(false);

        const startTime = performance.now();

        const animate = (currentTime) => {
            const t = Math.min((currentTime - startTime) / ANIMATION_DURATION, 1);

            camera.position.lerpVectors(startPosition, targetPosition, t);
            camera.quaternion.slerpQuaternions(startQuaternion, targetQuaternion, t);
            camera.up.copy(targetUp);

            controls.target.lerpVectors(startTarget, targetLookAt, t);

            camera.updateMatrix();
            camera.updateMatrixWorld(true);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                camera.position.copy(targetPosition);
                camera.up.copy(targetUp);
                camera.quaternion.copy(targetQuaternion);
                controls.target.copy(targetLookAt);

                this.enableControls(!fixUp);
                controls.update();
                onComplete();
            }
        };

        requestAnimationFrame(animate);
    }
}

export default CameraController;
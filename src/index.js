import * as THREE from "three";
import SceneManager from "./scene/sceneManager";
import './style.css';

window.addEventListener('DOMContentLoaded', () => {
	const sceneManager = new SceneManager();
	sceneManager.start();
});

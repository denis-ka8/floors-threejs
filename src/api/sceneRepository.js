import * as THREE from "three";
import Color from "../utils/color";
import { FLOOR } from "../config";

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max) + 1;
    return Math.floor(Math.random() * (max - min)) + min;
}

class SceneRepository {
    constructor() {}

    fetchFloorModels() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const placesData = [];
                for (let i=1; i<=FLOOR.dataCount; i++) {
                    placesData.push({
                        id: `shop_` + String(i).padStart(3, "0"),
                        name: "Shop " + i,
                        width: getRandomInt(FLOOR.minBoxWidth, FLOOR.maxBoxWidth),
                        depth: getRandomInt(FLOOR.minBoxDepth, FLOOR.maxBoxDepth),
                        color: new THREE.Color(Color.random().toHex("#"))
                    });
                }
                resolve(placesData);
            }, 1000);
        });
    }
}

export default SceneRepository;
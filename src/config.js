import { vec3 } from "./math/vec3";

const FLOOR = {
    // api
    dataCount: 100,
    // dataCount: 3000,
    minBoxWidth: 3,
    maxBoxWidth: 10,
    minBoxDepth: 3,
    maxBoxDepth: 10,

    // plane
	width: 100,
	depth: 100,
	// width: 500,
	// depth: 500,
	position: vec3(),

	dy: 1.1,
	loopRouteWidth: 4
}

export { FLOOR };
import { rect } from "../math/rect";
import { vec3 } from "../math/vec3";

const DEBUG = true;

function positioningBoxes(data, FLOOR) {
	const sortedShopsBySquare = data.slice().sort((a,b) => {
		return b.width * b.depth - a.width * a.depth;
	});

	const FLOOR_LEFT = -FLOOR.width / 2 + FLOOR.position.x;
	const FLOOR_TOP = -FLOOR.depth / 2 + FLOOR.position.z;
	const FLOOR_BOTTOM = FLOOR.depth / 2 + FLOOR.position.z;
	const FLOOR_RIGHT = FLOOR.width / 2 + FLOOR.position.z;
	DEBUG && console.log(`начальный периметр: сверху = ${FLOOR_TOP}, снизу = ${FLOOR_BOTTOM}, слева = ${FLOOR_LEFT}, справа = ${FLOOR_RIGHT}`)

	let leftSidePerimeter = rect(FLOOR_TOP, FLOOR_LEFT, FLOOR_BOTTOM, FLOOR_LEFT);
	let rightSidePerimeter = rect(FLOOR_TOP, FLOOR_RIGHT, FLOOR_BOTTOM, FLOOR_RIGHT);
	let topSidePerimeter = rect(FLOOR_TOP, FLOOR_RIGHT, FLOOR_TOP, FLOOR_LEFT);
	let bottomSidePerimeter = rect(FLOOR_BOTTOM, FLOOR_RIGHT, FLOOR_BOTTOM, FLOOR_LEFT);

	let i=0;

	for (const shop of sortedShopsBySquare) {
		// STEP 1: Position corner shops
		if (i===0) {
			shop.position = vec3(FLOOR_LEFT + shop.width / 2, FLOOR.dy, FLOOR_TOP + shop.depth / 2);
			leftSidePerimeter.top += shop.depth;
			topSidePerimeter.left += shop.width;
		} else if (i===1) {
			shop.position = vec3(FLOOR_LEFT + shop.width / 2, FLOOR.dy, FLOOR_BOTTOM - shop.depth / 2);
			leftSidePerimeter.bottom -= shop.depth;
			bottomSidePerimeter.left += shop.width;
		} else if (i===2) {
			shop.position = vec3(FLOOR_RIGHT - shop.width / 2, FLOOR.dy, FLOOR_TOP + shop.depth / 2);
			topSidePerimeter.right -= shop.width;
			rightSidePerimeter.top += shop.depth;
		} else if (i===3) {
			shop.position = vec3(FLOOR_RIGHT - shop.width / 2, FLOOR.dy, FLOOR_BOTTOM - shop.depth / 2);
			rightSidePerimeter.bottom -= shop.depth;
			bottomSidePerimeter.right -= shop.width;
		} else {
			// STEP 2: Position side shops
			if (shop.depth < leftSidePerimeter.height) {
				shop.position = vec3(leftSidePerimeter.left + shop.width / 2, FLOOR.dy, leftSidePerimeter.top + shop.depth / 2);
				leftSidePerimeter.top += shop.depth;
			} else if (shop.depth < rightSidePerimeter.height) {
				shop.position = vec3(rightSidePerimeter.right - shop.width / 2, FLOOR.dy, rightSidePerimeter.top + shop.depth / 2);
				rightSidePerimeter.top += shop.depth;
			} else if (shop.width < topSidePerimeter.width) {
				shop.position = vec3(topSidePerimeter.left + shop.width / 2, FLOOR.dy, topSidePerimeter.top + shop.depth / 2);
				topSidePerimeter.left += shop.width;
			} else if (shop.width < bottomSidePerimeter.width) {
				shop.position = vec3(bottomSidePerimeter.left + shop.width / 2, FLOOR.dy, bottomSidePerimeter.bottom - shop.depth / 2);
				bottomSidePerimeter.left += shop.width;
			} else {
				break;
			}
		}

		leftSidePerimeter.right = Math.min(FLOOR_RIGHT, Math.max(leftSidePerimeter.right, FLOOR_LEFT + shop.width));
		rightSidePerimeter.left = Math.max(FLOOR_LEFT, Math.min(rightSidePerimeter.left, FLOOR_RIGHT - shop.width));
		topSidePerimeter.bottom = Math.min(FLOOR_BOTTOM, Math.max(topSidePerimeter.bottom, FLOOR_TOP + shop.depth));
		bottomSidePerimeter.top = Math.max(FLOOR_TOP, Math.min(bottomSidePerimeter.top, FLOOR_BOTTOM - shop.depth));

		i++;
	}
	DEBUG && console.log(`смещение периметра после размещения угловых и у стен: сверху = ${topSidePerimeter.bottom-FLOOR_TOP}, снизу = ${FLOOR_BOTTOM-bottomSidePerimeter.top}, слева = ${leftSidePerimeter.right-FLOOR_LEFT}, справа = ${FLOOR_RIGHT-rightSidePerimeter.left}`)

	// Calculate center perimeter excluding route width
	let centerPerimeter = rect(topSidePerimeter.bottom, rightSidePerimeter.left, bottomSidePerimeter.top, leftSidePerimeter.right);
	DEBUG && console.log(`новый периметр: сверху = ${centerPerimeter.top}, снизу = ${centerPerimeter.bottom}, слева = ${centerPerimeter.left}, справа = ${centerPerimeter.right}`)

	DEBUG && console.log(`проходнвя дорожка = ${FLOOR.loopRouteWidth}`);
	centerPerimeter.top += FLOOR.loopRouteWidth;
	centerPerimeter.bottom -= FLOOR.loopRouteWidth;
	centerPerimeter.left += FLOOR.loopRouteWidth;
	centerPerimeter.right -= FLOOR.loopRouteWidth;
	DEBUG && console.log(`новый периметр без учета дорожки: сверху = ${centerPerimeter.top}, снизу = ${centerPerimeter.bottom}, слева = ${centerPerimeter.left}, справа = ${centerPerimeter.right}`)

	// STEP 3: Position shops on horizontal line
	const centerPerimeterOrigin = centerPerimeter.copy();
	// const sortedShopsWidth = sortedShopsBySquare.slice(i).sort((a,b) => b.width - a.width);
	let sortedShopsWidth = sortedShopsBySquare.slice(i).sort((a,b) => b.width/b.depth - a.width/a.depth);

	let lastIndex = positioningHorizontalLine(sortedShopsWidth, centerPerimeter, centerPerimeterOrigin, FLOOR);

	while (lastIndex > 0) {
		sortedShopsWidth = sortedShopsWidth.slice(lastIndex);
		centerPerimeter = centerPerimeterOrigin.copy();
		lastIndex = positioningHorizontalLine(sortedShopsWidth, centerPerimeter, centerPerimeterOrigin, FLOOR);
	}

	if (lastIndex === 0 && sortedShopsWidth.length) {
		// TODO: rotate
		// console.warn("Не хватает площади");
	}
}

function positioningHorizontalLine(data, perimeter, centerPerimeterOrigin, FLOOR) {
	if (!data.length) return 0;
	if (data[0].depth > perimeter.height) return 0;

	let i=0;
	let secondRow = false;
	let firstRowLastIndex = 0;
	let firstRowDepth = 0;
	let secondRowDepth = 0;
	perimeter.bottom = perimeter.top;
	for (const shop of data) {
		if (!secondRow && perimeter.width < shop.width) {
			firstRowLastIndex = i;
			secondRow = true;
			perimeter.top = perimeter.bottom;
			perimeter.bottom = centerPerimeterOrigin.bottom;
			perimeter.left = centerPerimeterOrigin.left;
		}
		if (secondRow) {
			if (perimeter.width < shop.width) break;
			if (perimeter.height < shop.depth) break;

			shop.position = vec3(perimeter.left + shop.width / 2, FLOOR.dy, perimeter.top + shop.depth / 2);
			// perimeter.bottom = Math.min(centerPerimeterOrigin.bottom, Math.max(perimeter.bottom, centerPerimeterOrigin.top + shop.depth));
			perimeter.left += shop.width;
			secondRowDepth = Math.max(shop.depth, secondRowDepth);
		} else {
			shop.position = vec3(perimeter.left + shop.width / 2, FLOOR.dy, perimeter.top + shop.depth / 2);
			perimeter.bottom = Math.min(centerPerimeterOrigin.bottom, Math.max(perimeter.bottom, centerPerimeterOrigin.top + shop.depth));
			perimeter.left += shop.width;
			firstRowDepth = Math.max(shop.depth, firstRowDepth);
		}
		i++;
	}

	for (let k=0; k<firstRowLastIndex; k++) {
		const shop = data[k];
		const dz = firstRowDepth - shop.depth;
		shop.position.z += dz;
	}

	DEBUG && console.log(`гориз. ряд 1 = ${firstRowDepth}`)
	DEBUG && console.log(`гориз. ряд 2 = ${secondRowDepth}`)
	centerPerimeterOrigin.top += firstRowDepth + secondRowDepth + FLOOR.loopRouteWidth;

	DEBUG && console.log(`центральный периметр без гориз. ряда и дорожки: сверху = ${centerPerimeterOrigin.top}, снизу = ${centerPerimeterOrigin.bottom}, слева = ${centerPerimeterOrigin.left}, справа = ${centerPerimeterOrigin.right}`)
	return i;
}

// Positioning not included boxes outside of area 
function positioningOther(data, FLOOR) {
	const gridSpacing = 2.1;
	const gridOffset = gridSpacing;
	const size = 5;
	let row = 1
	let col = 1
	const count = Math.ceil(Math.sqrt(data.length));
	for (let row = 1; row <= count; row++) {
		for (let col = 1; col <= count; col++) {
			const x = col * gridSpacing - gridOffset;
			const z = row * gridSpacing - gridOffset;

			const index = (row-1) * count + (col-1);
			if (index >= data.length) break
			const obj = data[index];
			if (!obj.position)
			obj.position = vec3(x * size - FLOOR.width / 2, 1.1, z * size - FLOOR.depth / 2 - 200);
		}
	}
}

export {
    positioningBoxes,
    positioningOther
}
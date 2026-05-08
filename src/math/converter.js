const MathConverter = {
	degreesToRadians: (degrees) => {
		return degrees * Math.PI / 180;
	},

	radiansToDegrees: (radians) => {
		return radians * 180 / Math.PI;
	}
};

export default MathConverter;
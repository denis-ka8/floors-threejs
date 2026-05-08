// TODO: remove
// use THREE.Color
class Color {
	constructor(r = 0.0, g = 0.0, b = 0.0, a = 1.0) {
		this._data = new Float32Array(4);
		this.set(r, g, b, a);
	}

	get r() { return this._data[0]; }
	set r(value) { this._data[0] = this._clamp(value); }

	get g() { return this._data[1]; }
	set g(value) { this._data[1] = this._clamp(value); }

	get b() { return this._data[2]; }
	set b(value) { this._data[2] = this._clamp(value); }

	get a() { return this._data[3]; }
	set a(value) { this._data[3] = this._clamp(value); }

	set(r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
		return this;
	}

	clone() {
		return new Color(this.r, this.g, this.b, this.a);
	}

	equals(other) {
		return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
	}

	toArray() {
		return this._data;
	}

	toRGBArray() {
		return this._data.slice(0, 3);
	}

	_clamp(value) {
		return Math.max(0.0, Math.min(1.0, value));
	}

	static white() { return new Color(1.0, 1.0, 1.0); }

	static black() { return new Color(); }

	static red() { return new Color(1.0, 0.0, 0.0); }

	static green() { return new Color(0.0, 1.0, 0.0); }

	static blue() { return new Color(0.0, 0.0, 1.0); }

	static gray(intensity = 0.5) { return new Color(intensity, intensity, intensity); }

	static random() {
		const r = Math.floor(Math.random() * 256) / 255;
		const g = Math.floor(Math.random() * 256) / 255;
		const b = Math.floor(Math.random() * 256) / 255;
		return new Color(r, g, b);
	}

	static fromHex(hex) {
		hex = hex.replace(/^(#|0x)/, '')
		if (hex.length === 3) {
			const r = parseInt(hex[0] + hex[0], 16) / 255;
			const g = parseInt(hex[1] + hex[1], 16) / 255;
			const b = parseInt(hex[2] + hex[2], 16) / 255;
			return new Color(r, g, b);
		} else if (hex.length === 6) {
			const r = parseInt(hex.slice(0, 2), 16) / 255;
			const g = parseInt(hex.slice(2, 4), 16) / 255;
			const b = parseInt(hex.slice(4, 6), 16) / 255;
			return new Color(r, g, b);
		} else {
			throw new Error('Invalid hex color format');
		}
	}

	toHex(prefix) {
		const normalizedPrefix = prefix.toLowerCase();

		if (!['', '0x', '#'].includes(normalizedPrefix)) {
			throw new Error("Prefix must be '0x', '#' or empty string");
		}

		const rHex = this._toTwoDigitHex(parseInt(this.r * 255));
		const gHex = this._toTwoDigitHex(parseInt(this.g * 255));
		const bHex = this._toTwoDigitHex(parseInt(this.b * 255));

		return `${normalizedPrefix}${rHex}${gHex}${bHex}`;
	}

	static fromRGBA(r, g, b, a = 255) {
		return new Color(r / 255, g / 255, b / 255, a / 255);
	}

	_toTwoDigitHex(value) {
		const hex = value.toString(16).padStart(2, '0');
		return hex;
	}
}

export default Color;
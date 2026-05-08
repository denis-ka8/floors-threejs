class EventEmitter {
  constructor() {
	this.events = {};
  }

  destructor() {}

  on(eventName, callback) {
	if (!this.events[eventName]) {
	  this.events[eventName] = [];
	}
	this.events[eventName].push(callback);
  }

  off(eventName, callback) {
	const callbacks = this.events[eventName];
	if (!callbacks) return;

	const index = callbacks.indexOf(callback);
	if (index !== -1) {
	  callbacks.splice(index, 1);
	}
  }

  emit(eventName, ...args) {
	const callbacks = this.events[eventName];
	if (callbacks) {
	  callbacks.forEach(callback => {
		callback.apply(this, args);
	  });
	}
  }

  trigger(eventName, ...args) {
	this.emit(eventName, ...args);
  }
}

export default EventEmitter;
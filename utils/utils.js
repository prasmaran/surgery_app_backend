const { Readable } = require("stream");

// Hidden for simplicity

const bufferToStream = (buffer) => {
	const readable = new Readable({
		read() {
			this.push(buffer);
			this.push(null);
		},
	});
	return readable;
};

module.exports = { bufferToStream };

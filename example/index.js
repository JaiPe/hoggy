const hoggy = require('../');

const adapter = {
	getValueXY = (image, x, y, channel) => image.myGetPixelAtFn(x, y, channel),
    toLuma601Greyscale = image => image.myGreyscale601TransformFn(),
    getMaxValue = image => image.maxValue,
    getHeight = image => image.height,
    getWidth = image => image.width
};

const options = {
	cellSize: 4,
	bins: 6,
	blockSize: 2,
	blockStride: 1
};

console.log(hoggy(image, options, adapter));

const hoggy = require("../");
const Jimp = require("jimp");

const options = {
    cellSize: 4,
    bins: 6,
    blockSize: 2,
    blockStride: 1
};

(async function example() {
    const image = await Jimp.read("../bobber/me.png");

    hoggy.generate(image.bitmap, options).then(hog => console.log(hog));
})();

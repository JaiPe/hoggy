Hoggy
===

Version of https://github.com/image-js/hog that works without any image libraries and uses ES6 and Promises.

# Key Changes

* The grayscaling logic has been removed, meaning a third party will need to perform this before generating the HoG.
* ImageData is accepted instead of an imageJS instance.
* Pixel colour extraction is now done implicitly, so there is no requirement of image-js or any instance-methods.
* Addition of TypeScript types
* Promise support

# Examples

```
const hoggy = require("hoggy");
const Image = require("image-js");

const photo = await Image.load("./my-photo.png");
const photoGrey = beachBall.grey({ algorithm: "luma601" });
hoggy.generate(photoGrey, {
    cellSize: 4,
    bins: 6,
    blockSize: 2,
    blockStride: 1,
    maxValue: 255 // new option
}).then(hog => console.log(hog));
```

```
const Jimp = require("jimp");

const image = await Jimp.read("./my-photo.png");
hoggy.generate(image.greyscale().bitmap, {
    cellSize: 2,
    bins: 8    
}).then(hog => console.log(hog));
```

# API

```js
// Sync
hoggy.generateSync(image, options);

// Async
hoggy.generate(image, options).then(value => console.log(value));
```

## Options

Options are the same as for https://github.com/image-js/hog with the addition of `maxValue`.

# Upcoming

Upcoming features will include splitting an image into segments and processing it on multiple threads.

# Contributions

... Are very welcome!

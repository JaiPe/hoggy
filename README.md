Hoggy
====

Version of https://github.com/image-js/hog that supports other image libraries other than image-js for the pixel plucking and grayscaling.

# API

`hoggy(image, options, adapter)`

## Adapter

* `getValueXYForChannel` `image, x, y, channel` - Allows passing a custom getter for the pixel XY by channel.
* `toLuma601Greyscale` `image` - Allows passing a custom grayscale transformer.
* `getMaxValue` `image` - Allows passing a custom getter for the maximum pixel colour value.
* `getHeight` `image` - Allows passing a custom getter for the height.
* `getWidth` `image` - Allows passing a custom getter for the width.

## Options

Options are the same as for https://github.com/image-js/hog

# Contributions

... Are very welcome!
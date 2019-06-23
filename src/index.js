"use strict";

const EPSILON = 0.00001;
const PI_RAD = 180 / Math.PI;

const defaultToLuma601Greyscale = image => image.grey({ algorithm: "luma601" });
const defaultGetValueXYForChannel = (image, ...args) =>
  image.getValueXY(...args);
const defaultGetMaxValue = image => image.maxValue;
const defaultGetHeight = image => image.height;
const defaultGetWidth = image => image.width;

/**
 * Extract the HOG of an image
 * @param {image} image - image to transform into a HOG descriptor
 * @param {object} options
 * @return {Array} Array with the value of the HOG descriptor
 */

function extractHOG(image, options = {}, adapter = {}) {
  const {
    blockSize = 2,
    blockStride = blockSize / 2,
    norm = "L2",
    cellSize = 4,
    bins = 6
  } = options;

  const {
    getValueXYForChannel = defaultGetValueXYForChannel,
    toLuma601Greyscale = defaultToLuma601Greyscale,
    getMaxValue = defaultGetMaxValue,
    getHeight = defaultGetHeight,
    getWidth = defaultGetWidth
  } = adapter;

  const histograms = extractHistograms(
    image,
    {
      cellSize,
      bins
    },
    {
      getHeight,
      getWidth,
      getMaxValue,
      getValueXYForChannel,
      toLuma601Greyscale
    }
  );
  const blocks = [];
  const blocksHigh = histograms.length - blockSize + 1;
  const blocksWide = histograms[0].length - blockSize + 1;

  for (let y = 0; y < blocksHigh; y += blockStride) {
    for (let x = 0; x < blocksWide; x += blockStride) {
      const block = getBlock(histograms, x, y, blockSize);
      normalize(block, norm);
      blocks.push(block);
    }
  }
  return Array.prototype.concat.apply([], blocks);
}

/**
 * Extract the histogram from an image
 * @param {image} image - image to transform into a HOG descriptor
 * @param {object} options
 * @return {Array<Array<number>>} Array 2D with the histogram, based on the gradient vectors
 */

function extractHistograms(image, options, adapter) {
  const { cellSize, bins } = options;
  const vectors = gradientVectors(adapter.toLuma601Greyscale(image), adapter);

  const cellsWide = Math.floor(vectors[0].length / cellSize);
  const cellsHigh = Math.floor(vectors.length / cellSize);

  const histograms = new Array(cellsHigh);

  for (let i = 0; i < cellsHigh; i++) {
    histograms[i] = new Array(cellsWide);

    for (let j = 0; j < cellsWide; j++) {
      histograms[i][j] = getHistogram(
        vectors,
        j * cellSize,
        i * cellSize,
        cellSize,
        bins
      );
    }
  }
  return histograms;
}

/**
 * Extract a square block from a matrix
 * @param {Array<Array<number>>} matrix
 * @param {number} x
 * @param {number} y
 * @param {number} length
 * @return {Array<Array<number>>} square block extracted from the matrix
 */

function getBlock(matrix, x, y, length) {
  const square = [];
  for (let i = y; i < y + length; i++) {
    for (let j = x; j < x + length; j++) {
      square.push(matrix[i][j]);
    }
  }
  return Array.prototype.concat.apply([], square);
}

/**
 * Extract the histogram of a part of the image (a cell with coordinate x and y)
 * @param {Array<Array<number>>} elements - gradient vectors of the image
 * @param {number} x
 * @param {number} y
 * @param {number} size - cellSize
 * @param {number} bins - number of bins per histogram
 * @return {Array<number>} Array 1D with the histogram of the cell, based on the gradient vectors
 */

function getHistogram(elements, x, y, size, bins) {
  const histogram = new Array(bins).fill(0);

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const vector = elements[y + i][x + j];
      const bin = binFor(vector.orient, bins);
      histogram[bin] += vector.mag;
    }
  }
  return histogram;
}

function binFor(radians, bins) {
  let angle = radians * PI_RAD;
  if (angle < 0) {
    angle += 180;
  }

  // center the first bin around 0
  angle += 90 / bins;
  angle %= 180;

  return Math.floor((angle / 180) * bins);
}

/**
 * Normalize a vector given with one of these norms : L1, L1-sqrt or L2 (norm by default). No return value, the input vector is modified.
 * @param {Array<number>} vector
 * @param {string} norm - should be 'L1', 'L1-sqrt' or 'L2'. Else, the norm will be the norm L2.
 */

function normalize(vector, norm) {
  let sum, denom;

  if (norm === "L1") {
    sum = 0;
    for (i = 0; i < vector.length; i++) {
      sum += Math.abs(vector[i]);
    }
    denom = sum + EPSILON;

    for (let i = 0; i < vector.length; i++) {
      vector[i] /= denom;
    }
  } else if (norm === "L1-sqrt") {
    sum = 0;
    for (let i = 0; i < vector.length; i++) {
      sum += Math.abs(vector[i]);
    }
    denom = sum + EPSILON;

    for (let i = 0; i < vector.length; i++) {
      vector[i] = Math.sqrt(vector[i] / denom);
    }
  } else {
    // i.e norm === 'L2'
    sum = 0;
    for (let i = 0; i < vector.length; i++) {
      sum += vector[i] * vector[i];
    }
    denom = Math.sqrt(sum + EPSILON);
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= denom;
    }
  }
}

function gradientVectors(
  image,
  { getValueXYForChannel, getHeight, getWidth, getMaxValue }
) {
  const width = getWidth(image);
  const height = getHeight(image);
  const maxValue = getMaxValue(image);

  const vectors = new Array(height);

  for (let y = 0; y < height; y++) {
    vectors[y] = new Array(width);
    for (let x = 0; x < width; x++) {
      const prevX =
        x === 0 ? 0 : getValueXYForChannel(image, x - 1, y, 0) / maxValue;
      const nextX =
        x === width - 1
          ? 0
          : getValueXYForChannel(image, x + 1, y, 0) / maxValue;
      const prevY =
        y === 0 ? 0 : getValueXYForChannel(image, x, y - 1, 0) / maxValue;
      const nextY =
        y === height - 1
          ? 0
          : getValueXYForChannel(image, x, y + 1, 0) / maxValue;

      // kernel [-1, 0, 1]
      const gradX = -prevX + nextX;
      const gradY = -prevY + nextY;

      vectors[y][x] = {
        mag: Math.sqrt(Math.pow(gradX, 2) + Math.pow(gradY, 2)),
        orient: Math.atan2(gradY, gradX)
      };
    }
  }
  return vectors;
}

module.exports = extractHOG;

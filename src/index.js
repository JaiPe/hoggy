"use strict";

const EPSILON = 0.00001;
const PI_RAD = 180 / Math.PI;

/**
 * Promise wrapper around generateSync logic
 * @param {ImageData} pixels - image to transform into a HOG descriptor
 * @param {object} options
 * @return {Promise<Array>} Promise of array with the value of the HOG descriptor
 */
function generate(imageData, options = {}) {
  return new Promise((resolve, reject) =>
    resolve(generateSync(imageData, options))
  );
}

/**
 * Extract the HOG of an image
 * @param {ImageData} pixels - image to transform into a HOG descriptor
 * @param {object} options
 * @return {Array} Array with the value of the HOG descriptor
 */

function generateSync(imageData, options = {}) {
  if (!imageData || !imageData.data || !imageData.width || !imageData.height) {
    throw new Error(
      "First argument must be ImageData containing { data, width, height }."
    );
  }

  if (
    imageData.data[0] !== imageData.data[1] ||
    imageData.data[1] !== imageData.data[2]
  ) {
    throw new Error("Image must be pre-processed as a greyscale image.");
  }

  const {
    blockSize = 2,
    blockStride = blockSize / 2,
    norm = "L2",
    cellSize = 4,
    bins = 6,
    maxValue = 255
  } = options;

  const histograms = extractHistograms(imageData, {
    cellSize,
    bins,
    maxValue
  });
  const blocks = [];
  const blocksHigh = histograms.length - blockSize + 1;
  const blocksWide = histograms[0].length - blockSize + 1;

  for (let y = 0; y < blocksHigh; y += blockStride) {
    for (let x = 0; x < blocksWide; x += blockStride) {
      const block = getBlock(histograms, x, y, blockSize);
      normalize(block, norm);
      blocks.push(...block);
    }
  }
  return blocks;
}

/**
 * Extract the histogram from an image
 * @param {image} image - image to transform into a HOG descriptor
 * @param {object} options
 * @return {Array<Array<number>>} Array 2D with the histogram, based on the gradient vectors
 */

function extractHistograms(imageData, options) {
  const { cellSize, bins, maxValue } = options;
  const vectors = gradientVectors(imageData, maxValue);

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
      square.push(...matrix[i][j]);
    }
  }
  return square;
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

function getChannelByPixelXY({ data, width }, x, y, channel) {
  return data[x + y * width + channel];
}

function gradientVectors(imageData, maxValue) {
  const { width, height } = imageData;

  const vectors = new Array(height);

  for (let y = 0; y < height; y++) {
    vectors[y] = new Array(width);
    for (let x = 0; x < width; x++) {
      const prevX =
        x === 0 ? 0 : getChannelByPixelXY(imageData, x - 1, y, 0) / maxValue;
      const nextX =
        x === width - 1
          ? 0
          : getChannelByPixelXY(imageData, x + 1, y, 0) / maxValue;
      const prevY =
        y === 0 ? 0 : getChannelByPixelXY(imageData, x, y - 1, 0) / maxValue;
      const nextY =
        y === height - 1
          ? 0
          : getChannelByPixelXY(imageData, x, y + 1, 0) / maxValue;

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

module.exports = {
  generate,
  generateSync
};

export declare function generate(
    imageData: ImageData | { width: number; height: number; data: Array<number> | Uint8Array | Uint8ClampedArray | Buffer },
    options?: {
        maxValue?: number;
        blockSize?: number;
        blockStride?: number;
        norm?: number;
        cellSize?: number;
        bins?: number;
    }
): Promise<Array<number>>;

export declare function generateSync(
    imageData: ImageData | { width: number; height: number; data: Array<number> | Uint8Array | Uint8ClampedArray | Buffer },
    options?: {
        maxValue?: number;
        blockSize?: number;
        blockStride?: number;
        norm?: number;
        cellSize?: number;
        bins?: number;
    }
): Array<number>;

export declare function generate(
    imageData: { width: number; height: number; data: Array<number> | Uint8Array | Uint8ClampedArray | Buffer },
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
    imageData: { width: number; height: number; data: Array<number> | Uint8Array | Uint8ClampedArray | Buffer },
    options?: {
        maxValue?: number;
        blockSize?: number;
        blockStride?: number;
        norm?: number;
        cellSize?: number;
        bins?: number;
    }
): Array<number>;

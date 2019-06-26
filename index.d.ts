export declare function generate(
    imageData: ImageData,
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
    imageData: ImageData,
    options?: {
        maxValue?: number;
        blockSize?: number;
        blockStride?: number;
        norm?: number;
        cellSize?: number;
        bins?: number;
    }
): Array<number>;

export declare const enum MIME {
    BMP = "image/bmp",
    JPEG = "image/jpeg",
    GIF = "image/gif",
    TIFF = "image/tiff",
    PNG = "image/png"
}

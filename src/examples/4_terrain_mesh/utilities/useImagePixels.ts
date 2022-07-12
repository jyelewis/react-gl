import { useEffect, useState } from "react";
import ndarray, { NdArray } from "ndarray";

// downloads image from url, provides pixels as NdArray (width, height, 4)
function getPixels(url: string): Promise<NdArray<Uint8Array>> {
  return new Promise<NdArray<Uint8Array>>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Unable to create 2d canvas context");
      }
      context.drawImage(img, 0, 0);
      const pixels = context.getImageData(0, 0, img.width, img.height);
      resolve(
        ndarray(
          new Uint8Array(pixels.data),
          [img.width, img.height, 4],
          [4, 4 * img.width, 1],
          0
        )
      );
    };
    img.onerror = err => reject(err);
    img.src = url;
  });
}

export function useImagePixels(imageUrl: string) {
  const [imagePixels, setImagePixels] = useState<
    undefined | NdArray<Uint8Array>
  >();
  useEffect(() => {
    (async () => {
      const pixels = await getPixels(imageUrl);
      setImagePixels(pixels);
    })().catch(console.error);
  }, [imageUrl]);

  return imagePixels;
}

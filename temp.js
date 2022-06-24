function generateAliasFromImageData(imageData) {
	if (typeof imageData === "string" || isArrayBufferView(imageData)) {
		return sHashCode(imageData);
	} else if (isArrayBufferView(imageData.data)) {
		return sHashCode(imageData.data);
	}

	return null;
};

function isArrayBufferView(object) {
	return (
		supportsArrayBuffer() &&
		typeof Uint32Array !== "undefined" &&
		(object instanceof Int8Array ||
			object instanceof Uint8Array ||
			(typeof Uint8ClampedArray !== "undefined" &&
				object instanceof Uint8ClampedArray) ||
			object instanceof Int16Array ||
			object instanceof Uint16Array ||
			object instanceof Int32Array ||
			object instanceof Uint32Array ||
			object instanceof Float32Array ||
			object instanceof Float64Array)
	);
}

function sHashCode(data) {
	var hash = 0, i, len;

	if (typeof data === "string") {
		len = data.length;
		for (i = 0; i < len; i++) {
			hash = (hash << 5) - hash + data.charCodeAt(i);
			hash |= 0; // Convert to 32bit integer
		}
	} else if (isArrayBufferView(data)) {
		len = data.byteLength / 2;
		for (i = 0; i < len; i++) {
			hash = (hash << 5) - hash + data[i];
			hash |= 0; // Convert to 32bit integer
		}
	}
	return hash;
};

jsPDFAPI.processPNG = function(imageData, index, alias, compression) {
	"use strict";

	var colorSpace,
		filter = this.decode.FLATE_DECODE,
		bitsPerComponent,
		image,
		decodeParameters = "",
		trns,
		colors,
		pal,
		smask,
		pixels,
		len,
		alphaData,
		imgData,
		hasColors,
		pixel,
		i,
		n;

	if (this.__addimage__.isArrayBuffer(imageData))
		imageData = new Uint8Array(imageData);

	if (this.__addimage__.isArrayBufferView(imageData)) {
		image = new PNG(imageData);
		imageData = image.imgData;
		bitsPerComponent = image.bits;
		colorSpace = image.colorSpace;
		colors = image.colors;

		/*
		 * colorType 6 - Each pixel is an R,G,B triple, followed by an alpha sample.
		 *
		 * colorType 4 - Each pixel is a grayscale sample, followed by an alpha sample.
		 *
		 * Extract alpha to create two separate images, using the alpha as a sMask
		 */
		if ([4, 6].indexOf(image.colorType) !== -1) {
			/*
			 * processes 8 bit RGBA and grayscale + alpha images
			 */
			if (image.bits === 8) {
				pixels =
					image.pixelBitlength == 32
						? new Uint32Array(image.decodePixels().buffer)
						: image.pixelBitlength == 16
						? new Uint16Array(image.decodePixels().buffer)
						: new Uint8Array(image.decodePixels().buffer);
				len = pixels.length;
				imgData = new Uint8Array(len * image.colors);
				alphaData = new Uint8Array(len);
				var pDiff = image.pixelBitlength - image.bits;
				i = 0;
				n = 0;
				var pbl;

				for (; i < len; i++) {
					pixel = pixels[i];
					pbl = 0;

					while (pbl < pDiff) {
						imgData[n++] = (pixel >>> pbl) & 0xff;
						pbl = pbl + image.bits;
					}

					alphaData[i] = (pixel >>> pbl) & 0xff;
				}
			}

			/*
			 * processes 16 bit RGBA and grayscale + alpha images
			 */
			if (image.bits === 16) {
				pixels = new Uint32Array(image.decodePixels().buffer);
				len = pixels.length;
				imgData = new Uint8Array(
					len * (32 / image.pixelBitlength) * image.colors
				);
				alphaData = new Uint8Array(len * (32 / image.pixelBitlength));
				hasColors = image.colors > 1;
				i = 0;
				n = 0;
				var a = 0;

				while (i < len) {
					pixel = pixels[i++];

					imgData[n++] = (pixel >>> 0) & 0xff;

					if (hasColors) {
						imgData[n++] = (pixel >>> 16) & 0xff;

						pixel = pixels[i++];
						imgData[n++] = (pixel >>> 0) & 0xff;
					}

					alphaData[a++] = (pixel >>> 16) & 0xff;
				}
				bitsPerComponent = 8;
			}

			if (canCompress(compression)) {
				imageData = compressBytes(
					imgData,
					image.width * image.colors,
					image.colors,
					compression
				);
				smask = compressBytes(alphaData, image.width, 1, compression);
			} else {
				imageData = imgData;
				smask = alphaData;
				filter = undefined;
			}
		}

		/*
		 * Indexed png. Each pixel is a palette index.
		 */
		if (image.colorType === 3) {
			colorSpace = this.color_spaces.INDEXED;
			pal = image.palette;

			if (image.transparency.indexed) {
				var trans = image.transparency.indexed;
				var total = 0;
				i = 0;
				len = trans.length;

				for (; i < len; ++i) {
					total += trans[i];
				}

				total = total / 255;

				/*
				 * a single color is specified as 100% transparent (0),
				 * so we set trns to use a /Mask with that index
				 */
				if (total === len - 1 && trans.indexOf(0) !== -1) {
					trns = [trans.indexOf(0)];

					/*
					 * there's more than one colour within the palette that specifies
					 * a transparency value less than 255, so we unroll the pixels to create an image sMask
					 */
				} else if (total !== len) {
					pixels = image.decodePixels();
					alphaData = new Uint8Array(pixels.length);
					i = 0;
					len = pixels.length;

					for (; i < len; i++) {
						alphaData[i] = trans[pixels[i]];
					}

					smask = compressBytes(alphaData, image.width, 1);
				}
			}
		}

		var predictor = getPredictorFromCompression(compression);

		if (filter === this.decode.FLATE_DECODE) {
			decodeParameters = "/Predictor " + predictor + " ";
		}
		decodeParameters +=
			"/Colors " +
			colors +
			" /BitsPerComponent " +
			bitsPerComponent +
			" /Columns " +
			image.width;

		if (
			this.__addimage__.isArrayBuffer(imageData) ||
			this.__addimage__.isArrayBufferView(imageData)
		) {
			imageData = this.__addimage__.arrayBufferToBinaryString(imageData);
		}

		if (
			(smask && this.__addimage__.isArrayBuffer(smask)) ||
			this.__addimage__.isArrayBufferView(smask)
		) {
			smask = this.__addimage__.arrayBufferToBinaryString(smask);
		}

		return {
			alias: alias,
			data: imageData,
			index: index,
			filter: filter,
			decodeParameters: decodeParameters,
			transparency: trns,
			palette: pal,
			sMask: smask,
			predictor: predictor,
			width: image.width,
			height: image.height,
			bitsPerComponent: bitsPerComponent,
			colorSpace: colorSpace
		};
	}
};
import { PNG } from './libs/png.js';

window.onload = function () {
	// 캔버스
	let canvas = document.getElementById("canvas");
	let ctx  = canvas.getContext("2d");
	ctx .font = "36px Helvetica";
	ctx.fillStyle = "red";
	ctx .fillText('김현수', 0, 40);
	// 이미지
	let img = document.getElementById("exportedImage");
	img.src = canvas.toDataURL('image/png');

	document.getElementById("download").addEventListener("click", download_3);

};

// 다운로드
function download_1(e) {
	let download = document.getElementById("download");
	let image = document.getElementById("canvas").toDataURL("image/png")
							.replace("image/png", "image/octet-stream");
	download.setAttribute("href", image);

	const { jsPDF } = window.jspdf;
	const doc = new jsPDF(
		{filters: ['FlateEncode']}
	);

	doc.addImage('./image.png', 0, 0, 129, 54);
	doc.addImage(document.getElementById("canvas").toDataURL("image/png"), 0, 0, 129, 54);
	doc.save("a4.pdf");
}

function download_2(e) {
	var canvas = document.createElement("canvas");                               
	// document.body.appendChild(canvas);                                           
	canvas.width = 129;                                            
	canvas.height = 54;                                                         
	var ctx = canvas.getContext("2d");                                           
	ctx .font = "36px Helvetica";
	ctx.fillStyle = "red";
	ctx.fillText('김현수', 0, 40);
			
	const { jsPDF } = window.jspdf;
	var doc = new jsPDF({filters: ['FlateEncode']});

	doc.addImage(canvas.toDataURL("image/png"), 0, 0, 129, 54);
	doc.save("png.pdf");
}

function download_3(e) {
	var canvas = document.createElement("canvas");                                                                     
	canvas.width = 129;                                            
	canvas.height = 54;                                                         
	var ctx = canvas.getContext("2d");                                           
	ctx .font = "36px Helvetica";
	ctx.fillStyle = "red";
	ctx.fillText('김현수', 0, 40);

	let imageData = canvas.toDataURL("image/png");
	let x = 0, y = 0, w = 129, h = 54;
	let format = 'PNG', alias = 1433677741;

	imageData = unescape(imageData);
	imageData = convertBase64ToBinaryString(imageData, false);
	let dataAsBinaryString = imageData;
	imageData = binaryStringToUint8Array(imageData);
	let image = new PNG(imageData);
	imageData = image.imgData;
	let bitsPerComponent = image.bits;
	let colorSpace = image.colorSpace;
	let colors = image.colors; 
	let smask;

	if ([4, 6].indexOf(image.colorType) !== -1) {
		let imgData, alphaData;

		/*
		 * processes 8 bit RGBA and grayscale + alpha images
		 */
		if (image.bits === 8) {
			let pixels =
				image.pixelBitlength == 32
					? new Uint32Array(image.decodePixels().buffer)
					: image.pixelBitlength == 16
					? new Uint16Array(image.decodePixels().buffer)
					: new Uint8Array(image.decodePixels().buffer);
			let len = pixels.length;
			imgData = new Uint8Array(len * image.colors);
			alphaData = new Uint8Array(len);
			let pDiff = image.pixelBitlength - image.bits;
			let n = 0;
			for (let i = 0; i < len; i++) {
				let pixel = pixels[i];
				let pbl = 0;

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
			let pixels = new Uint32Array(image.decodePixels().buffer);
			let len = pixels.length;
			imgData = new Uint8Array(
				len * (32 / image.pixelBitlength) * image.colors
			);
			alphaData = new Uint8Array(len * (32 / image.pixelBitlength));
			let hasColors = image.colors > 1;
			let i = 0, n = 0, a = 0;
			while (i < len) {
				let pixel = pixels[i++];

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

		imageData = imgData;
		smask = alphaData;
	}
}

function convertBase64ToBinaryString(stringData, throwError) {
	throwError = typeof throwError === "boolean" ? throwError : true;
	var base64Info;
	var imageData = "";
	var rawData;

	if (typeof stringData === "string") {
		base64Info = extractImageFromDataUrl(stringData);
		rawData = base64Info !== null ? base64Info.data : stringData;

		try {
			imageData = atob(rawData);
		} catch (e) {
			if (throwError) {
				if (!validateStringAsBase64(rawData)) {
					throw new Error(
						"Supplied Data is not a valid base64-String jsPDF.convertBase64ToBinaryString "
					);
				} else {
					throw new Error(
						"atob-Error in jsPDF.convertBase64ToBinaryString " + e.message
					);
				}
			}
		}
	}
	return imageData;
}

function extractImageFromDataUrl(dataUrl) {
	dataUrl = dataUrl || "";
	var dataUrlParts = dataUrl.split("base64,");
	var result = null;

	if (dataUrlParts.length === 2) {
		var extractedInfo = /^data:(\w*\/\w*);*(charset=(?!charset=)[\w=-]*)*;*$/.exec(
			dataUrlParts[0]
		);
		if (Array.isArray(extractedInfo)) {
			result = {
				mimeType: extractedInfo[1],
				charset: extractedInfo[2],
				data: dataUrlParts[1]
			};
		}
	}
	return result;
}

function validateStringAsBase64(possibleBase64String) {
	possibleBase64String = possibleBase64String || "";
	possibleBase64String.toString().trim();

	var result = true;

	if (possibleBase64String.length === 0) {
		result = false;
	}

	if (possibleBase64String.length % 4 !== 0) {
		result = false;
	}

	if (
		/^[A-Za-z0-9+/]+$/.test(
			possibleBase64String.substr(0, possibleBase64String.length - 2)
		) === false
	) {
		result = false;
	}

	if (
		/^[A-Za-z0-9/][A-Za-z0-9+/]|[A-Za-z0-9+/]=|==$/.test(
			possibleBase64String.substr(-2)
		) === false
	) {
		result = false;
	}
	return result;
}

function binaryStringToUint8Array(binary_string) {
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
};
window.onload = function () {
	// 캔버스로 그리기
  document.getElementById("drawCanvas").addEventListener("click", (e) => {
		drawText_2();
  });
};

function drawText_1() {
	let canvas = document.getElementById("canvas");
	let ctx  = canvas.getContext("2d");
	ctx.font = "36px Helvetica";
	ctx.fillStyle = `rgba(0, 0, 255, 0.5)`;
	ctx.textBaseline = "alphabetic"; // "top" "hanging" "middle" "alphabetic" "ideographic" "bottom"
	ctx.fillText('aQbgS김현수', 72.5, 88);
}

function drawText_2() {
	let textObj = document.getElementById("textObj");
	let bbox = textObj.getBBox();

	let canvas = document.getElementById("canvas");
	let ctx  = canvas.getContext("2d");
	let image = new Image();
	image.src = createPngImage(bbox, 'aQbgS김현수', 72.5 - bbox.x, 88 - bbox.y, {r:0, g:0, b:1}, '/Helvetica', 36, 1);
	image.onload = () => {
		ctx.drawImage(image, bbox.x, bbox.y, bbox.width, bbox.height);
	};
}

function createPngImage(rect, contents, x, y, textColor, font, fontSize, opacity) {
	const scaleX = 2, scaleY = 2;
	const w = rect.width, h = rect.height;
	let canvas = document.createElement("canvas");
	canvas.width = w * scaleX, canvas.height = h * scaleY;
	let ctx = canvas.getContext("2d");
	ctx.scale(scaleX, scaleY);
  ctx.imageSmoothingEnabled = false;
	ctx.font = `${fontSize}px ${font.replace('/', '')}`;
	ctx.fillStyle = `rgba(${Math.floor(255 * textColor.r)}, ${Math.floor(255 * textColor.g)}, ${Math.floor(255 * textColor.b)}, ${opacity ?? 1})`;
	ctx.fillText(contents, x, y);
  return canvas.toDataURL("image/png");
}

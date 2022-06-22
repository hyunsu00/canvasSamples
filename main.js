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

};

// 다운로드
function download() {
	// let download = document.getElementById("download");
	// let image = document.getElementById("canvas").toDataURL("image/png")
	// 						.replace("image/png", "image/octet-stream");
	// download.setAttribute("href", image);

	// const { jsPDF } = window.jspdf;
	// const doc = new jsPDF(
	// 	{filters: ['FlateEncode']}
	// );

	// doc.addImage('./image.png', 0, 0, 129, 54);
	// doc.addImage(document.getElementById("canvas").toDataURL("image/png"), 0, 0, 129, 54);
	// doc.save("a4.pdf");

	var canvas = document.createElement("canvas");                               
	document.body.appendChild(canvas);                                           
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
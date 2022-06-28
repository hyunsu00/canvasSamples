window.onload = function () {
	// 캔버스로 그리기
  document.getElementById("drawCanvas").addEventListener("click", (e) => {
    let canvas = document.getElementById("canvas");
		let ctx  = canvas.getContext("2d");
		ctx .font = "36px Helvetica";
		ctx.fillStyle = `rgba(0, 0, 255, 0.5)`;
		ctx.textBaseline = "alphabetic"; // "top" "hanging" "middle" "alphabetic" "ideographic" "bottom"
		ctx.fillText('aQbgS김현수', 72.5, 88);
  });
};
window.addEventListener('message', function (event) {
  let data = event.data;
  // console.log("[contentScripts] " + JSON.stringify(data));
  chrome.extension.sendMessage(data);
}, false);


let gameCanvas = document.querySelector("#GameCanvas");
if (gameCanvas) {
  // console.log('find GameCanvas element');
  // gameCanvas.addEventListener('click', function () {
  //   console.log("click canvas");
  // });
  // gameCanvas.style.display = 'none';
} else {
  // console.log("can't find GameCanvas element");
  chrome.extension.sendMessage({type: 0, msg: "no creator game!"});
}




window.addEventListener('message', function (event) {
  let data = event.data;
  // console.log("[contentScripts] " + JSON.stringify(data));
  chrome.extension.sendMessage(data);
}, false);


let gameCanvas = document.querySelector("#GameCanvas");
if (gameCanvas) {
  console.log('find GameCanvas element');
  // gameCanvas.addEventListener('click', function () {
  //   console.log("click canvas");
  // });
  // gameCanvas.style.display = 'none';
  // chrome.extension.sendMessage("hello Cocos");
} else {
  console.log("can't find GameCanvas element");
}
// window.postMessage({type: 1, msg: "window.messageTest"}, '*');




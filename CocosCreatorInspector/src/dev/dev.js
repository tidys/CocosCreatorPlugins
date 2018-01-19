// 检查游戏是否为cocos游戏
// var cc={};
// if (typeof cc === "undefined") {
//   console.log("该html不是cocos游戏,无法调试!");
//   chrome.devtools.panels.elements.createSidebarPane("Creator Properties", function (sidebar) {
//     // console.log("[Cocos Creator Inspector] CreateSidebarPane");
//     // sidebar.setObject({ some_data: "Some data to show" });
//     sidebar.setPage("devNoGame.html");
//   });
//   chrome.devtools.panels.create(
//     "Cocos",
//     "static/images/icon48.png",
//     "devNoGame.html", function (panel) {
//       // console.log("[Cocos Creator Inspector] Dev Panel Created!");
//     });
//
// } else {
//
// }
chrome.devtools.panels.elements.createSidebarPane('My SliderBar', function (sidebar) {
  sidebar.setObject({some_data: "some data to show!"});
});

chrome.devtools.panels.create(
  "Cocos",
  "static/images/icon48.png",
  "devInspector.html",
  function (panel) {
    console.log("[Cocos Creator Inspector] Dev Panel Created!");

    panel.onShown.addListener(function (window) {
      console.log("panel show");
    });
    panel.onHidden.addListener(function (window) {
      console.log("panel hide");
    });
    panel.onSearch.addListener(function (action, query) {
      console.log("panel search!");
      return false;
    });
  }
);

// (function () {
//   var t = window.setInterval(function () {
//      egret && egret.devtool &&
//       egret.devtool.start &&
//       (window.clearInterval(t) || egret.devtool.start());
//     console.log("waiting")
//   }, 100);
//   egret && egret.devtool && egret.devtool.start && (window.clearInterval(t) || egret.devtool.start());
// })();

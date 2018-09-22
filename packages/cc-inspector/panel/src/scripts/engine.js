
var originMainLoop = cc.director.mainLoop;
cc.director.mainLoop = function () {
    try {
        originMainLoop.call(cc.director);
    }
    catch (err) {
        console.error(err);
    }
};

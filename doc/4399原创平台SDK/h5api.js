function waitH5apiInit(a, b) {
    h5api.initAPI ? a.apply(this, b) : setTimeout(waitH5apiInit, 100, a, b)
}

!function () {
    function a() {
        "undefined" !== typeof seajs_4399_h5api && "undefined" !== typeof e4f9a75bcfa78ae97f1461a38bb5e01a
            ?
            (
                seajs_4399_h5api.config(
                    {
                        base: c,
                        alias: {Main: "Main.js?v=" + e4f9a75bcfa78ae97f1461a38bb5e01a}
                    }
                ),
                    seajs_4399_h5api.use("Main")
            )
            :
            setTimeout(a, 1);
    }

    function b(a) {
        var b = document.createElement("script");
        return b.setAttribute("type", "text/javascript"), b.setAttribute("src", a), document.body.appendChild(b), b
    }

    var c = "http://stat.api.4399.com/h5api/";
    b(c + "sea_4399_h5api.js"), b(c + "h5api_version.js?random=" + Math.random()), a()
}();
var ApiEvent = {
    User: {LOGIN: "userLogin", LOGOUT: "userLogout"},
    Score: {SUBMIT: "scoreSubmit", RANK: "scoreRank"},
    Pay: {CLOSE_PANEL: "payClosePanel", SUCCESS: "paySuccess", FAILURE: "payfailure", ERROR: "payError"}
};
var h5api = {
    initGame: function () {
        waitH5apiInit(h5api.initGame, arguments)
    },
    progress: function () {
        waitH5apiInit(h5api.progress, arguments)
    },
    hideProgress: function () {
        window.a9c88be80bbfff9b78c99c14e3549a06 = !0
    },
    isWeixinBrowser: function () {
        return null
    },
    share: function () {
        waitH5apiInit(h5api.share, arguments)
    },
    moreGame: function () {
        waitH5apiInit(h5api.moreGame, arguments)
    },
    on: function () {
        waitH5apiInit(h5api.on, arguments)
    },
    addEventListener: function () {
        waitH5apiInit(h5api.addEventListener, arguments)
    },
    removeEventListener: function () {
        waitH5apiInit(h5api.removeEventListener, arguments)
    },
    submitScore: function () {
        waitH5apiInit(h5api.Score.submitScore, arguments)
    },
    getRank: function () {
        waitH5apiInit(h5api.Score.getRank, arguments)
    },
    User: {
        openLoginPanel: function () {
            waitH5apiInit(h5api.User.openLoginPanel, arguments)
        }, getUserInfo: function () {
            return null
        }, logout: function () {
            waitH5apiInit(h5api.User.logout, arguments)
        }
    },
    Score: {
        submitScore: function () {
            waitH5apiInit(h5api.Score.submitScore, arguments)
        }, getRank: function () {
            waitH5apiInit(h5api.Score.getRank, arguments)
        }
    },
    Pay: {
        openRechargePanel: function () {
            waitH5apiInit(h5api.Pay.openRechargePanel, arguments)
        }
    }
};
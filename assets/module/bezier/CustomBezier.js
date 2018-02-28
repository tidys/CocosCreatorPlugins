cc.customBezierBy = function (t, c) {
    return new cc.CustomBezierBy(t, c);
};
cc.CustomBezierBy = cc.ActionInterval.extend({
    _config: null,
    _pascal: null,
    _startPosition: null,
    _previousPosition: null,

    ctor: function (time, pointArr) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._config = [];

        this._startPosition = cc.p(0, 0);
        this._previousPosition = cc.p(0, 0);

        pointArr && this.initWithDuration(time, pointArr);
    },
    initWithDuration: function (time, pointArr) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, time)) {
            this._config = pointArr;
            this._pascal = this.getPascalTriangleRow(pointArr.length);
            return true;
        }
        return false;
    },

    clone: function () {
        let action = new cc.CustomBezierBy();
        this._cloneDecoration(action);
        let newConfigs = [];
        for (let i = 0; i < this._config.length; i++) {
            let selConf = this._config[i];
            newConfigs.push(cc.p(selConf.x, selConf.y));
        }
        action.initWithDuration(this._duration, newConfigs);
        return action;
    },

    startWithTarget: function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        let locPosX = target.getPositionX();
        let locPosY = target.getPositionY();
        this._previousPosition.x = locPosX;
        this._previousPosition.y = locPosY;
        this._startPosition.x = locPosX;
        this._startPosition.y = locPosY;
    },

    getBezierLinePoint(pointNum) {
        let locConfig = this._config;
        let posX = [0];
        let posY = [0];
        for (let i = 0; i < locConfig.length; i++) {
            posX.push(locConfig[i].x);
            posY.push(locConfig[i].y);
        }

        let ret = [];
        for (let i = 0; i < pointNum; i++) {
            let t = i / pointNum;
            ret.push(cc.p(this._getPos(posX, t), this._getPos(posY, t)))
        }
        return ret;
    },

    _getPos(posArr, dt) {
        let number = posArr.length;
        let pascalCfg = this._pascal;// 杨辉三角参数必须和点的数量一致
        let dis = 0;
        if (number === pascalCfg.length) {
            for (let i = 0; i < pascalCfg.length; i++) {
                dis += Math.pow(1 - dt, number - i - 1) * Math.pow(dt, i) * posArr[i] * pascalCfg[i];
            }
        } else {
            dis = 0;
        }
        return dis;
    },
    update: function (dt) {
        dt = this._computeEaseTime(dt);
        if (this.target) {
            let locConfig = this._config;
            let posX = [0];
            let posY = [0];
            for (let i = 0; i < locConfig.length; i++) {
                posX.push(locConfig[i].x);
                posY.push(locConfig[i].y);
            }

            let x = this._getPos(posX, dt);
            let y = this._getPos(posY, dt);
            let locStartPosition = this._startPosition;
            if (cc.macro.ENABLE_STACKABLE_ACTIONS) {
                let targetX = this.target.getPositionX();
                let targetY = this.target.getPositionY();
                let locPreviousPosition = this._previousPosition;

                locStartPosition.x = locStartPosition.x + targetX - locPreviousPosition.x;
                locStartPosition.y = locStartPosition.y + targetY - locPreviousPosition.y;
                x = x + locStartPosition.x;
                y = y + locStartPosition.y;
                locPreviousPosition.x = x;
                locPreviousPosition.y = y;
                this.target.setPosition(x, y);
            } else {
                this.target.setPosition(locStartPosition.x + x, locStartPosition.y + y);
            }
        }
    },

    reverse: function () {
        let locConfig = this._config;
        let r = [
            cc.pAdd(locConfig[1], cc.pNeg(locConfig[2])),
            cc.pAdd(locConfig[0], cc.pNeg(locConfig[2])),
            cc.pNeg(locConfig[2])];
        let action = new cc.CustomBezierBy(this._duration, r);
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    },
    test() {
        /*
        let Bt, P0, P1, P2, P3, t;
        // 一阶
        Bt =
            Math.pow(1 - t, 1) * Math.pow(t, 0) * P0 * 1 +
            Math.pow(1 - t, 0) * Math.pow(t, 1) * P1 * 1;
        // 二阶
        Bt =
            Math.pow(1 - t, 2) * Math.pow(t, 0) * P0 * 1 +
            Math.pow(1 - t, 1) * Math.pow(t, 1) * P1 * 2 +
            Math.pow(1 - t, 0) * Math.pow(t, 2) * P2 * 1;
        // 三阶(3个点)
        Bt =
            Math.pow(1 - t, 3) * Math.pow(t, 0) * P0 * 1 +
            Math.pow(1 - t, 2) * Math.pow(t, 1) * P1 * 3 +
            Math.pow(1 - t, 1) * Math.pow(t, 2) * P2 * 3 +
            Math.pow(1 - t, 0) * Math.pow(t, 3) * P3 * 1;*/


    },
    // 杨辉三角(从1开始)
    getFullPascalTriangle(totalLine) {
        function Combination(m, n) {
            if (n === 0) {
                return 1;
            } else if (m === n) {
                return 1;
            } else {
                return Combination(m - 1, n - 1) + Combination(m - 1, n);
            }
        }

        function Pascal(n) {
            let ret = [];
            for (let i = 0; i < n; i++) {
                ret.push([]);
                for (let j = 0; j <= i; j++) {
                    ret[i][j] = Combination(i, j);
                }
            }
            return ret;
        }


        let result = Pascal(totalLine);
        return result;
        // 输出打印
        /*let str = "";
        for (let i = 0; i < result.length; i++) {
            for (let j = 0; j < result[i].length; j++) {
                str += result[i][j] + " ";
            }
            str += "\n";
        }
        console.log(str);*/
    },
    // 获取杨辉三角的某一行(从0开始)
    getPascalTriangleRow(rowIndex) {
        let result = [];
        if (rowIndex < 0) {
            return result;
        }
        let i, j, r;
        let v;
        for (r = 0; r <= rowIndex; r++) {
            v = [];
            for (i = 0; i <= r; i++) {
                v.push(1);
            }

            for (i = 1; i <= rowIndex - r; i++) {
                for (j = 1; j <= r; j++) {
                    v[j] += v[j - 1];
                }
            }
            result.push(v[r]);
        }
        return result;
    }
});

cc.customBezierTo = function (t, c) {
    return new cc.CustomBezierTo(t, c);
};

cc.CustomBezierTo = cc.CustomBezierBy.extend({
    _toConfig: null,
    _toPascal: null,

    ctor: function (t, c) {
        cc.CustomBezierBy.prototype.ctor.call(this);
        this._toConfig = [];
        c && this.initWithDuration(t, c);
    },

    /*
     * Initializes the action.
     * @param {Number} t time in seconds
     * @param {Vec2[]} c - Array of points
     * @return {Boolean}
     */
    initWithDuration: function (t, c) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, t)) {
            this._toConfig = c;
            this._toPascal = this.getPascalTriangleRow(c.length);
            return true;
        }
        return false;
    },

    clone: function () {
        let action = new cc.CustomBezierTo();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._toConfig);
        return action;
    },

    startWithTarget: function (target) {
        cc.CustomBezierBy.prototype.startWithTarget.call(this, target);
        this._calcConfig();
    },
    _calcConfig() {
        this._pascal = this._toPascal;
        let locStartPos = this._startPosition;
        let locToConfig = this._toConfig;
        let locConfig = this._config;

        for (let i = 0; i < locToConfig.length; i++) {
            locConfig[i] = cc.pSub(locToConfig[i], locStartPos);
        }
    },
    getBezierLinePoint(pointNum) {
        let locPosX = this._toConfig[0].x;
        let locPosY = this._toConfig[0].y;
        this._previousPosition.x = locPosX;
        this._previousPosition.y = locPosY;
        this._startPosition.x = locPosX;
        this._startPosition.y = locPosY;
        this._calcConfig();
        let arr = cc.CustomBezierBy.prototype.getBezierLinePoint.call(this, pointNum);

        for (let i = 0; i < arr.length; i++) {
            arr[i].x += locPosX;
            arr[i].y += locPosY;
        }


        console.log(arr.toString());
        return arr;
    }
});
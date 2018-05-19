window.globalMessage = {
    //自增ID
    msgID: 0,
    //监听者列表
    msgList: [],
    //事件列表
    listenerMap: new Map(),
    //增加消息监听
    AddListener:function(msgType, callback, target){
        //回调对象
        let msgListener = {
            callback: callback,
            target: target,
        };

        let listener = this.listenerMap.get(msgType);
        if (listener!=null) {
            listener.push(msgListener);
        }
        else{
            let arr = new Array(msgListener);
            this.listenerMap.set(msgType, arr);
        }
    },
    //发消息
    PostMsg:function(msgType, time, msgData){
        this.msgID++;
        if (this.msgID > 100000000) {
            this.msgID = 1;
        }
        //事件对象
        var msgEvent = {
            id: this.msgID,
            msgType: msgType,
            data: msgData,
            time: time,//毫秒
        };
        this.msgList.push(msgEvent);
        return this.msgID;
    },
    //更新队列
    Update:function(second){
        if (this.msgList.length > 0) {
            for (let i = 0; i < this.msgList.length; i++) {
                let msg = this.msgList[i];
                msg.time -= second;
                if (msg.time < 0) {
                    let listener = this.listenerMap.get(msg.msgType);
                    if (listener!=null) {
                        for (let j = 0; j < listener.length; j++) {
                            listener[j].callback.call(listener[j].target, msg);
                        }
                    }
                    this.msgList.splice(i, 1);
                    i--;
                }
            }
        }
    },
    //删除一条消息
    DeleteMsg:function(msgID){
        for (let index = 0; index < this.msgList.length;index++) {
            if (this.msgList[index].msgID==msgID) {
                this.msgList.splice(index,1);
                break;
            }
        }
    },
    //删除回调,删除该消息类型的所有回调
    DeleteListenerByType:function(msgType){
        if (this.listenerMap.has(msgType)) {
            this.listenerMap.delete(msgType);
        }
    },
    //删除回调,删除该消息类型的一个回调
    DeleteListenerByTarget:function(msgType, target){
        let listener = this.listenerMap.get(msgType);
        if (listener!=null) {
            for (let index = 0; index < listener.length; index++) {
                if (listener[index].target===target) {
                    listener.splice(index,1);
                    break;
                }
            }
        }
    }
};

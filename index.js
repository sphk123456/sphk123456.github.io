// 弹幕类
const Barrage = class {
  // WebSocket 地址
  wsurl = "ws://127.0.0.1:9527";
  // 断线重连定时器
  timer = null;
  // 断线重连轮询间隔
  timeinterval = 10 * 1000;
  // 属性 ID
  propsId = null;
  // 聊天 DOM 元素
  chatDom = null;
  // 房间加入 DOM 元素
  roomJoinDom = null;
  // WebSocket 实例
  ws = null;
  // 观察者
  observer = null;
  // 聊天观察者
  chatObserverrom = null;
  // 选项
  option = {};
  // 事件
  event = {};
  // 事件注册
  eventRegirst = {};

  // 构造函数，接收选项参数，默认开启消息事件
  constructor(option = { join: true, message: true }) {
    this.option = option;
    let { link, removePlay } = option;

    // 设置 WebSocket 地址和是否移除播放器
    if (link) {
      this.wsurl = link;
    }
    if (removePlay) {
      // 移除播放器元素
      document.querySelector(".basicPlayer").remove();
    }

    // 获取 DOM 元素的属性 ID
    this.propsId = Object.keys(
      document.querySelector(".webcast-chatroom___list")
    )[1];
    this.chatDom = document.querySelector(
      ".webcast-chatroom___items"
    ).children[0];
    this.roomJoinDom = document.querySelector(
      ".webcast-chatroom___bottom-message"
    );

    // 创建 WebSocket 实例并设置连接回调
    this.ws = new WebSocket(this.wsurl);
    this.ws.onclose = this.wsClose;
    this.ws.onopen = () => {
      // WebSocket 连接成功时的回调
      this.openWs();
    };
  }

  // 注册事件回调，支持 join 和 message 事件
  on(e, cb) {
    this.eventRegirst[e] = true;
    this.event[e] = cb;
  }

  // WebSocket 连接成功时的回调
  openWs() {
    console.log(`[${new Date().toLocaleTimeString()}]`, "服务已经连接成功!");
    clearInterval(this.timer);
    // 连接成功后运行服务器
    this.runServer();
  }

  
  // WebSocket 断开时的回调（原来的）
  wsClose() {
    console.log("服务器断开");
    if (this.timer !== null) {
      return;
    }
    // 断线重连定时器
    this.observer && this.observer.disconnect();
    this.chatObserverrom && this.chatObserverrom.disconnect();
    this.timer = setInterval(() => {
      console.log("正在等待服务器启动..");
      // 重新创建 WebSocket 实例
      this.ws = new WebSocket(wsurl);
      console.log("状态 ->", this.ws.readyState);
      setTimeout(() => {
        if (this.ws.readyState === 1) {
          openWs();
        }
      }, 2000);
    }, this.timeinterval);
  }


  // 运行服务器，包括监听用户加入房间和聊天消息事件
  runServer() {
    let _this = this;
    if (this.option.join) {
      // 监听点赞和加入房间
      this.observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
          if (mutation.type === "childList" && mutation.addedNodes.length) {
            let dom = mutation.addedNodes[0];
            // .payload.user
            let message = dom[this.propsId].children.props.message;

            // console.log('let user = dom[this.propsId].children.props.message.payload.user;')
            // console.log(dom[this.propsId].children.props.message)
            // 如果是点赞
            if (message.method == "WebcastLikeMessage") {
              // console.log("Before sending message. WebSocket state:", this.ws.readyState);
              // this.ws.send(
              //   JSON.stringify({
              //     action: "LIKE",
              //     nickname: message.payload.user.nickname,
              //   })
              // );
              // console.log("Message sent. WebSocket state:", this.ws.readyState);

            }
            // 如果是加入直播间
            if (message.method == "WebcastMemberMessage") {
              // console.log("Before sending message. WebSocket state:", this.ws.readyState);
              // this.ws.send(
              //   JSON.stringify({
              //     action: "Member",
              //     nickname: message.payload.user.nickname,
              //   })
              // );
              // console.log("Message sent. WebSocket state:", this.ws.readyState);

            }
            // 其他的情况暂时就先不管
          }
        }
      });
      this.observer.observe(this.roomJoinDom, { childList: true });
    }
    if (this.option.message) {
      // 监听聊天消息事件（礼物消息、聊天消息、其他消息）
      this.chatObserverrom = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
          if (mutation.type === "childList" && mutation.addedNodes.length) {
            let dom = mutation.addedNodes[0];
            let message = dom[this.propsId].children.props.message;
            
            // console.log(
            //   "let message = dom[this.propsId].children.props.message;"
            // );

            // console.log(message);
            if (message) {
              switch (message.method) {
                // 礼物
                case "WebcastGiftMessage":
                  console.log(message)
                  console.log("Before sending message. WebSocket state:", this.ws.readyState);
                  this.ws.send(
                    JSON.stringify({
                      action: "GIFT",
                      nickname: message.payload.user.nickname,
                      user_avatar:message.payload.user.avatar_thumb.url_list[0],
                      giftname: message.payload.gift.name,
                      gift_repeat_count: parseInt(message.payload.repeat_count),
                      giftimg: message.payload.common.display_text.pieces[2].image_value.image.url_list[0],
                    })
                  );
                  console.log("Message sent. WebSocket state:", this.ws.readyState);

                  break;
                // 聊天消息
                case "WebcastChatMessage":
                  // console.log("Before sending message. WebSocket state:", this.ws.readyState);
                  // this.ws.send(
                  //   JSON.stringify({
                  //     action: "CHAT",
                  //     nickname: message.payload.user.nickname,
                  //     content: message.payload.content,
                  //   })
                  // );
                  // console.log("Message sent. WebSocket state:", this.ws.readyState);

                  break;
                // 其他类型消息暂时先不管
              }
            }
          }
        }
      });
      this.chatObserverrom.observe(this.chatDom, { childList: true });
    }
  }



};

// 如果有定义 onDouyinServer 函数，则调用
if (window.onDouyinServer) {
  window.onDouyinServer();
}

// 全局函数，用于移除视频图层
window.removeVideoLayer = function () {
  document.querySelector(".basicPlayer").remove();
  console.log("删除画面成功,不影响弹幕信息接收");
};
removeVideoLayer();

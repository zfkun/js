Activity Monitor
=============

#### Feature:
+ ...

#### TODO:
+ ...

#### Update:
+ stay参数变为每次请求均附带，值为至请求发送时的停留时长（单位毫秒） - 2012/4/23
+ 新增aid 参数，值为guid相同算法（即与参数 key 结构相同）
    + 此参数值不存COOKIE
    + 不同用户/同用户不同页面/同访客同页面不同状态/多开页面/多浏览器等等均不同
    + 即唯一身份识别 

#### Useage:
    ActivityMonitor(options).start():
        @options:
            @deprecated
            stopAt:
            warnAt:
            
            @available
            callAt:
            notifyBy:
            notify:
            interval:
            uri:
            callback:

#### Example:

###### 1. Basic
    ActivityMonitor().start();
    ....

###### 2. Custom Options
    ActivityMonitor({
        //stopAt : 5, // deprecated (just for guestor)
        //warnAt : 2, // deprecated (just for guestor)
        notifyBy : 3,
        notify : window.myNotifyFn,
        interval : 2000,
        uri : 'http://yourstat/?from={p}&aid={a}&uid={u}&key={k}&stay={s}&time={r}'
    }).start();
    ...

Simple [DEMO](http://zfkun.github.com/js/demo/QKActivity/)

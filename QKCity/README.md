简易多级联动插件
=============

#### Update:
+ 新增仿QQ注册页的联动插件 - 2012/1/17

#### Feature:
+ 支持无限级联动
+ 支持默认提示项配置(data-emptyText)
+ 支持默认提示功能开关(offEmpty: true|false)
+ 支持各级初始化默认值指定
+ 数据源支持多实例共享，避免浪费
+ ...

#### TODO:
+ 代码梳理(时间仓促)
+ 内存管理优化
+ 数据源按需加载,提高初始化速度及文件体积
+ 支持数据源动态更新(增/删/改)
+ 代码体积优化,逻辑结构优化
+ 数据源结构优化
+ 数据源结构可自定义
+ ...

#### Useage:
    QKCity(selectIds, selectValues, options):
        @selectIds:      需关联的Select元素集合(按上下级升序排列)
        @selectValues:   对应Select元素集合的默认值(非必选)
        @options:        其他配置(非必选)
            offEmpty:    是否启用首项占位提示(默认true)
                         offEmpty为true时，
                         优先使用Select元素的data-emptyText属性值
                         (默认"-请选择-")

#### Example:

###### 1. Basic
    QKCity(['b1', 'b2', 'b3']);
    ....
    QKCity(['d1', 'd2', 'd3'], [12, 1202, 120202]);

###### 2. Custom Options
    QKCity(['e1', 'e2', 'e3'], [], { offEmpty : true });
    ...
    QKCity(['h1', 'h2', 'h3'], [12, 1202, 120202], { offEmpty : true });

###### 3. By Markup
    QKCity(['i1', 'i2', 'i3']);
    ...
    QKCity(['l1', 'l2', 'l3'], [12, 1202, 120202]);


Simple [DEMO1](http://zfkun.github.com/QKCity/demo/)(7k7k)  [DEMO2](http://zfkun.github.com/QKCity/demo/qq.html)(qq)

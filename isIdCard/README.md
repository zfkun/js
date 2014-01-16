# IdCard Checker

## Update

+ 新增DEMO - 2012/4/13

## Feature

+ 支持新老号码(15/18位)
+ 支持X结尾号码
+ ...

## TODO

+ 代码梳理(时间仓促)
+ 内存管理优化
+ 代码体积优化,逻辑结构优化
+ 数据源结构优化
+ ...

## Useage

### (boolean) isIdCard( str ):

`str`: string, 需检查的身份证号码

## Example

``` javascript
isIdCard( '111111111111111' );
// => false
```

``` javascript
isIdCard('130531197507143717');
// => true
```

## DEMO

+ [Simple Demo 1](http://zfkun.github.io/js/demo/IsIdCard/)

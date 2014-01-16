# AD Coupleter

AD Coupleter widget for `7K7K`

## Update

+ bug fixed & code rebuild - 2012/9/29

## Feature

+ manual render method
+ webpage content size custom
+ AD marign & padding custom
+ AD Item rect size custom
+ click stat url param custom
+ AD UI's z-index custom
+ ...

## TODO

+ ...

## Useage

``` javascript
QKCoupleter( options )

new QKCoupleter( options )
```

### Basic

``` javascript
QKCoupleter({
     data: [
        'http://xxx/left.gif,http://xxx/stat',
        'http://xxx/right.gif,http://xxx/stat'
    ]
});
```

### Custom Data

``` javascript
QKCoupleter({
    data: [
        'http://xxx/left.gif,http://xxx/stat?type=1,myTitleString',
        'http://xxx/right.gif,http://xxx/stat?type=2,otherTitleString'
    ]
});
```

### Custom Other Options

``` javascript
QKCoupleter({
    page: 800,
    margin: [50, 20],
    min: 600,
    max: 2000,
    zIndex: 99,
    param: { tag: 'forTest', tag2: 'aaa' },
    width: 100,
    height: 500,
    data: [
        'http://xxx/left.gif,http://xxx/stat',
        'http://xxx/right.gif,http://xxx/stat'
    ]
});
```

## DEMO

+ [Simple DEMO](http://zfkun.github.io/js/demo/QKCoupleter/)

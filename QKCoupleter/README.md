AD Coupleter for 7K7K
=============

#### Update:
+ bug fixed & code rebuild - 2012/9/29

#### Feature:
+ manual render method
+ webpage content size custom
+ AD marign & padding custom
+ AD Item rect size custom
+ click stat url param custom
+ AD UI's z-index custom
+ ...

#### TODO:
+ ...

#### Useage:
    QKCoupleter(options);
    or
    new QKCoupleter(options);

#### Example:

###### 1. Basic
    QKCoupleter({
	    data: [
    	    'http://xxx/left.gif,http://xxx/stat',
    	    'http://xxx/right.gif,http://xxx/stat'
        ]
    });

###### 2. Custom Data
    QKCoupleter({
	    data: [
    	    'http://xxx/left.gif,http://xxx/stat?type=1,myTitleString',
    	    'http://xxx/right.gif,http://xxx/stat?type=2,otherTitleString'
        ]
    });

###### 3. Custom Other Options
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


Simple [DEMO](http://zfkun.github.com/js/demo/QKCoupleter/)
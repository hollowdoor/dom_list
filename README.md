dom-list
========

If a browser supports the [iteration protocal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) `dom-list` is an [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of).

Install
-------

`npm install --save dom-list`

Constructor
-----------

### domList(element|selector, items, template funciton)

### domList(element|selector, template function)

The **template function** is a filter function used on all modifying array methods on `dom-list`. Return a string, or DOM element from the **template function**.

The element/selector, and template parameters are not optional.

The items parameter is optional.

### Basic usage

```html
<!DOCTYPE html>
<html>
<head>
    <title>Dom list test</title>
</head>
<body>
    <ol id="list"></ol>
    <script>
    var domList = require('dom-list'),
        ol = domList('#list', function(item){
            return `<li>${item}</li>`;
        });

    ol.push('John Smith');
    ol.push('Jane Smith');
    </script>
</body>
</html>

```

The HTML for **#list** will now look like this:

```html
<ol id="list">
    <li>John Smith</li>
    <li>Jane Smith</li>
</ol>
```

Templates
---------

It's fine to use other HTML elements other than list item type elements. As long as you're aware those elements are being operated on like an array. Make sure there is only one parent element though otherwise you will have problems. **The DOM children count to array member count should be one to one for each item.**

The template callback is just a filter. You can use what ever templating library you prefer, return an es template literal, a plain string, or a DOM element.

You can pass objects, or whatever to array altering operations like `push`. These will be passed to the template callback like any value. **No value is altered** before it is passed to the template callback.

Array Methods
-------------

Most of the methods on `dom-list` are borrowed from javascript arrays.

Visit [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) if you need a refresher. The usage of `dom-list` should feel very familiar.

Removal type methods like `shift`, `splice` or `pop` only produce a plain array so you would have to create a new `dom-list` to use arrays returned by those methods in a new element. To get elements from a `dom-list`, and move them you would do something like this:

```javascript
var text = ol.shift();
var newList = domList('#someotherselector', [text], ol.template);
```

or you might do this:

```javascript
var text = ol.shift();
var newList = domList('#someotherselector', ol.template);
newList.push(text);
```

Altering Methods
----------------

These methods do something to the array stored in a dom-list instance. By extension the DOM of the list is also altered in the same way.

-	pop
-	push
-	shift
-	sort
-	splice
-	unshift
-	fill
-	flood

Any of the above with the exception of flood works just like an array method with an extra DOM operation.

### flood

flood is a special method that overwrites the entire array contents inside a dom-list. A splice will also work for this.

```javascript
ol.flood(['Bobby Jo', 'Billy Jo']);
```

Now the previous list looks like this:

```html
<ol id="list">
    <li>Bobby Jo</li>
    <li>Billy Jo</li>
</ol>
```

### sort

Sort works just like Array.prototype.sort.

Find yourself some [natural sort algorithms](https://www.npmjs.com/search?q=natural+sort) to beat the funky default sort javascript arrays use.

Non-altering methods
--------------------

These methods test, or create without modifying the dom-list contents.

-	every
-	filter
-	forEach
-	join
-	map
-	reduce
-	reverse
-	slice
-	some

All of those methods work just like on an array. Creation methods like `map` create a wholly new array free from DOM manipulations.

ES2015 methods
--------------

All of these methods may, or may not work. Use at your discretion. If you polyfill these methods on the Array.prototype before you use `dom-list` these methods will work just fine.

-	find
-	findIndex
-	includes
-	keys
-	values

Array methods that act strange.
-------------------------------

There are array methods that of course do what you expect only part of the time.

### indexOf

Still works badly with user created objects. Which is to be expected.

### includes

Has the same issues as indexOf.

### concat

On `dom-list` instances concat works fine with a little magic inside, but if you try to use a `dom-list` instance in the argument of another array's concat method you will have problems because `concat` is not aware of the array likeness of `dom-list`. If you would rather concat from another array do this instead:

```javascript
var list = [],
    newList = [].push.apply(list, ol /*A dom-list instance.*/);
```

See here [Array.prototype.concat is not generic](http://www.2ality.com/2012/02/concat-not-generic.html) for more about this problem. Be aware the `push.apply` will not work in ie6-8, but who cares about those browsers.

Attention!
----------

You can *get items by array index* just fine with a `dom-list`, but you probably don't want to set by array index. Some very nasty things will happen.

Instead use `dom-list` instance methods to modify the `dom-list` array.

Also javascript arrays, and objects are mutable references so be careful to be aware that if you alter any object pushed, or spliced to the `dom-list` because that will alter any old object, or array values.

Special methods
---------------

### each(function)

Iterate the DOM elements using `function` inside a `dom-list` instance. This is different from `forEach` which will iterate the items of a `dom-list`.

The parameters of the `each` callback are the same as a callback used by `Array.prototype.forEach`: **callback(element, index, all)**.

### update(index, value)

Set a value at the specified index.

### remove()

Remove the present `dom-list` from the DOM. Returns `this` of the current `dom-list`. Use `domList.appendTo` to place this `dom-list` back in the DOM.

### on(event, callback)

Set an event with a listener callback.

### on(event, selector, callback)

Delegate an event on the selector. This is most likely what you'll be doing for the larger DOM sets (like tables) you'll be creating.

### off(event, callback)

Remove an event.

### get(index, child)

Get a child of the root element by index. Alternatively get a child by it's children.

If you pass a child the `parentNode` is searched iteratively until the `root` is matched, and you get the top child.

This is good for things like events where you want the element created by the template callback.

```javascript
//Click any where in a html list item.
ol.on('click', 'li', function(e){
    var li = ol.get(e.target));
    console.log(li); // -> "[object HTMLLIElement]"
});
```

### select(selector)

Returns a [bonzo](https://www.npmjs.com/package/bonzo) instance with all the elements that match the **selector**.

If no selector is passed then the top level element of the list is selected, and returned. For instance:

```javascript
ol.select().remove();
```

will remove the entire `ul` tag, and it's children from the DOM.

Set some css:

```javascript
ol.select('li').css({color: 'green'});
```

See the [bonzo](https://www.npmjs.com/package/bonzo) lib module to learn more.

#### Why bonzo?

Good question. It is a minimal DOM manipulation library with good support that's not jQuery. It's a good fit.

Be aware that removing, or adding elements with bonzo instances created by `dom-list` might foul up your `dom-list` instance. You could create irreconcilable alterations to your list. This also goes for other DOM manipulations you might do with plain `element.appendChild`, `element.insertBefore`, or `element.replaceChild` on elements created by `dom-list`. **You've been warned**.

Use `dom-list` instance methods to alter the DOM created by `dom-list`. Otherwise you can do other operations like css using bonzo with no consequences as long as you're careful.

Static Methods
--------------

These escape, or unescape a string for HTML respectively.

-	domList.escape(string) -> escaped string
-	domList.unescape(string) -> unsafe string

Instance Properties
-------------------

### root

The element set in the first argument of the constructor.

### children

An accessor to the DOM children of root for easy access.

Extension
---------

Extend the prototype of `dom-list` by attaching methods to `domList.fn`. All methods attached this way will be available to all `dom-list` instances.

```javascript
var domList = require('dom-list');
domList.fn.hello = function(){
    console.log('hello extension');
};
```

About
-----

This library is not meant to replace other DOM manipulation libraries. In fact one of the objectives was to make `dom-list` as small as possible so other libs will easily live right next to this one.

You could very easily use underscore, and jQuery right along with `dom-list`.

`dom-list` is an attempt at making large data sets in HTML a little easier to work with. An element with *10,000* children can take a long time to modify, but maybe `dom-list` won't be so slow because it **batches DOM operations** for methods that take multiple items. Even while batching DOM operations `dom-list` will still preserve the array type semantics for its instances. That is to say you are for the most part only limited by just memory, and processing power instead of memory, processing power, the callstack, and DOM visual reflow.

### Testing

All testing was done in [electron](http://electron.atom.io/) for convenience. Here are some speed stats for DOM operations using the `flood` method:

-	10000 elements (1236 milliseconds)
-	20000 elements (4870 milliseconds)
-	30000 elements (9995 milliseconds)
-	40000 elements (17564 milliseconds)
-	50000 elements (26611 milliseconds)
-	60000 elements (37777 milliseconds)

These times are not indicative of how quickly the DOM view is updated. There is a latency once all operations are complete while the webview recalculates everything. As you can see the performance is not exponential, and gets a little better with larger operations. Don't ask me why this happens. 20000 is only more than double 10000, but 60000 is only more than double 40000 for time spent. Go figure.

For large addition operations like `splice`, and `flood` any thing above 30,000 at once should be done in batches. I tested at a hundred thousand, and my webview froze. You could get away with 60,000 array items, but that's up to your use case. My thinking is that most the time a list will be at most 2000 items, or less so speed for bulk operations will be blazing most of the time. :)

I used the following method to create a pre-populated array for these tests:

```javascript
var list = [];
list.length = 10000;
list = list.join('*').split('');
```

Freezing could have been exacerbated by using this kind of array creation.

A similar speed to normal arrays can be expected for methods like `push`, and `pop` which could be catastrophically slow any time for 500-100000 array items added, or removed respectively. Take a look at [push vs unshift](https://jsperf.com/array-push-vs-unshift) for some stats on normal arrays.

You might get different results if you *browserify* your script, and run in some other browser.

### Other stuff

In a sense I guess you could call a `dom-list` observable because it's an array that updates the DOM, but stictly speaking I don't think so. Still it works in a similar way to an observable. Even though this would be considered one way binding being that you still need to bind regular events to detect changes to `value`, or some other changing DOM attribute.

For **functional** type operations like `filter` the native method is used so you get the benefits of native speed from those types of methods.

Happy coding!

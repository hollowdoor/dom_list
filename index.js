var select = require('select-dom'),
    domFrom = require('dom-from'),
    bonzo = require('bonzo'),
    bean = require('bean');

/*
git remote add origin https://github.com/hollowdoor/dom_list.git
git push -u origin master
*/

bean.setSelectorEngine(select.all);

function DomList(root, items, template){
    if(template === undefined && typeof items === 'function'){
        template = items;
        items = null;
    }

    if(typeof root === 'string'){
        try{
            this.root = select(root);
        }catch(e){ throw new TypeError('DomList constructor Error '+e.message);}
    }else{
        this.root = root;
    }

    Object.defineProperty(this, 'children', {
        value: this.root.children
    });

    this.template = template;

    //Non-altering type methods
    //They don't need to use this interface
    this.every = Array.prototype.every;
    this.filter = Array.prototype.filter;
    this.forEach = Array.prototype.forEach;
    this.indexOf = Array.prototype.indexOf;
    this.join = Array.prototype.join;
    this.map = Array.prototype.map;
    this.reduce = Array.prototype.reduce;
    this.reverse = Array.prototype.reverse;
    this.slice = Array.prototype.slice;
    this.some = Array.prototype.some;
    //es2015
    this.find = Array.prototype.find || undefined;
    this.findIndex = Array.prototype.findIndex || undefined;
    this.includes = Array.prototype.includes || undefined;
    this.keys = Array.prototype.keys || undefined;
    this.values = Array.prototype.values || undefined;

    if(items)
        this.flood(items);
}

DomList.prototype = {
    constructor: DomList,
    concat: function(){
        var items = Array.prototype.push.apply([], this);
        return Array.prototype.concat.apply(items, arguments);
    },
    pop: function(){
        this.root.removeChild(this.root.children[this.root.childre.length - 1]);
        return Array.prototype.pop.call(this);
    },
    push: function(item){
        var contents = this._process(item);
        this.root.appendChild(contents);
        return Array.prototype.push.call(this, item);
    },
    shift: function(){
        this.root.removeChild(this.firstChild);
        return Array.prototype.shift.call(this);
    },
    sort: function(){
        var items = [];
        Array.prototype.push.apply(items, this);
        result = Array.prototype.sort.apply(items, arguments);
        this.flood(items);
        return result;
    },
    splice: function(start, deleteCount, itemN){
        if(start > this.length){
            start = 0;
        }else if(start < 0){
            start = this.length - (start * -1);
        }
        var items = Array.prototype.slice.call(arguments, 2),
            html, count, index = 0, i;

        if(deleteCount > 0){
            count = start + deleteCount;
            if(count > this.length)
                count = this.length;
            for(i=start; i<count; i++){
                this.root.removeChild(this.root.children[i]);
            }
        }

        html = this._multi_process(items);

        this.root.insertBefore(html, this.root.children[start]);
        return Array.prototype.splice.apply(this, arguments);
    },
    unshift: function(){
        var frag = document.createDocumentFragment();
        for(var i=0; i<arguments.length; i++){
            frag.appendChild(this._process(arguments[i]));
        }
        this.root.insertBefore(frag, this.firstChild);
        return Array.prototype.unshift.call(this, arguments);
    },

    fill: function(value, start, end){
        var temp = [], count = end-start, frag;
        for(var i=0; i<count; i++){
            temp.push(value);
        }

        frag = this._multi_process(temp);
        for(i=start; i<end; i++){
            this.root.removeChild(this.root.children[i]);
        }

        this.root.insertBefore(frag, this.root.children[start + 1]);
        return Array.prototype.slice.apply(this, [start, end].concat(temp));
    },
    flood: function(items){
        this.root.innerHTML = '';
        this.root.appendChild(this._multi_process(items));
        this.length = 0;
        return Array.prototype.push.apply(this, items);
    },
    _multi_process: function(items){
        var frag = document.createDocumentFragment(), html;
        for(var i=0; i<items.length; i++){
            html = this._process(items[i]);
            frag.appendChild(html);
        }
        return frag;
    },
    _process: function(item){
        var data, html;
        try{
            data = JSON.stringify(item);
        }catch(e){
            data = ''+item;
        }

        html = this.template(item);
        html = domFrom(html);

        if(html.nodeType === Node.DOCUMENT_FRAGMENT_NODE){ //A DocumentFragment
            html.firstChild.setAttribute('data-store', data);
        }else if(html.nodeType === Node.ELEMENT_NODE){ //An HTML Element
            html.setAttribute('data-store', data);
        }
        return html;
    },
    appendTo: function(el){
        el.appendChild(this.root);
    },
    each: function(selector, fn){
        var elements;
        if(fn === undefined && typeof selector === 'function'){
            fn = selector;
            selector = null;
            elements = Array.prototype.slice.call(this.root.children);
            elements.forEach(fn);
        }else if(typeof fn === 'function' && typeof selector === 'string'){

            elements = Array.prototype.slice.call(select.all(selector, this.root));
            elements.forEach(fn);
        }
        return this;
    },
    remove: function(){
        this.root.parentNode.removeChild(this.root);
        return this;
    },
    select: function(selector){
        if(typeof selector === 'string'){
            return bonzo(select.all(selector, this.root));
        }else if(selector !== undefined && selector.nodeType > 0){
            return bonzo(selector);
        }else{
            return bonzo(this.root);
        }
    },
    update: function(index, item){
        var html = this.template(item),
            c = this.root.children[index];

        this.root.replaceChild(html, this.root.children[index]);
    },
    on: function(event, delegate, fn){
        if(fn === undefined && typeof delegate === 'function'){
            fn = delegate;
            delegate = null;
            bean.on(this.root, event, fn);
        }else{
            bean.on(this.root, event, delegate, fn);
        }
        return this;
    },
    off: function(event, fn){
        if(fn === undefined){
            bean.off(this.root, event);
        }else{
            bean.off(this.root, event, fn);
        }
        return this;
    },
    get: function(index){
        var p;
        if(!isNaN(index)){
            return this.root.children[index];
        }
        if(index.nodeType !== undefined && index.nodeType > 0){
            try{
                if(index.parentNode === this.root){
                    return index;
                }
                
                while(p = index.parentNode){
                    if(p.parentNode === this.root){
                        return p;
                    }
                }
                return null;
            }catch(e){
                throw new TypeError(index + ' is not a number, or a DOM element.');
            }
        }
    }
};

DomList.prototype[Symbol ? Symbol.iterator : "@@iterator"] = function(){
    var index = -1, self = this;
    return {
        next: function(){
            if(++index === self.length)
                return {done: true};
            else {
                return {done: false, value: self[index]};
            }
        }
    };
};

function DomListEx(root, items, template){
    return new DomList(root, items, template);
}


//Escape function from http://shebang.brandonmintern.com/foolproof-html-escaping-in-javascript/
DomListEx.escape = function(str){
    str = str + '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
};
//Only use on already escaped strings.
DomListEx.unescape = function(escapedStr){
    var div = document.createElement('div');
    div.innerHTML = escapedStr;
    var child = div.childNodes[0];
    return child ? child.nodeValue : '';
};

DomListEx.fn = DomList.prototype;

module.exports = DomListEx;

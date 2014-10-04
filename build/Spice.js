(function(root, $, Bacon){
  'use strict';

  function abstract_method(){ throw 'abstract method'; }
  function noop(){}
  function getStack(){ return (new Error()).stack; }
  
  function asProperty(value){
    if(value instanceof Bacon.Observable){
      return value.toProperty();
    } else {
      return Bacon.constant(value);
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // STREAM CONTEXT
  /////////////////////////////////////////////////////////////////////////////
  function Context(data, index){
    this.data   = data;
    this.index  = index;
  }
  Context.prototype.eval = function(callback){
    return callback(this.data, this.index);
  };

  /////////////////////////////////////////////////////////////////////////////
  // CURSOR
  /////////////////////////////////////////////////////////////////////////////
  function Cursor(){
    this._$el      = $(document.createTextNode(''));
    this._contents = [];
  }
  Cursor.prototype.open  = function(el){
    this._$el.appendTo(el);
  };
  Cursor.prototype.close = function(){
    this._$el.remove();
  };
  Cursor.prototype.write = function(content){
    this._contents.push(content);
    this._$el.before(content);
  };
  Cursor.prototype.clear = function(){
    this._contents.forEach(function(el){
      $(el).remove();
    });
    this._contents = [];
  };
  Cursor.prototype.clone = function(){
    var clone = new Cursor();
    this.write(clone._$el);
    return clone;
  };

  /////////////////////////////////////////////////////////////////////////////
  // ABSTRACT BASE CLASS
  /////////////////////////////////////////////////////////////////////////////
  function BaseStream(){
  }
  BaseStream.prototype._init = function(){
    this._tags      = {};
    this._modifiers = {};
    this._clear     = new Bacon.Bus();
    this._name      = null;
  };
  /**
   * Register a function as a tag writer for this stream
   */
  BaseStream.prototype.defineTag = function(name, tag){
    tag.displayName = tag.displayName || name;
    this[name] = function(){
      var args  = [].slice.call(arguments);
      var child = tag.apply(this, args);
      child._name = name + '(' + args.map(function(a){ return a.toString(); }).join(',') + ')';
      return child.parent(this);
    };
    this[name].displayName = 'tag';
    this._tags[name]       = tag;

    return this;
  };
  /**
   * Register a function as a attribute modifier for this stream
   */
  BaseStream.prototype.defineModifier = function(name, modifier){
    modifier.displayName = modifier.displayName || name;
    this[name] = function(){
      var args   = [].slice.call(arguments);
      this.call(function applyModifier(el){
        var ctx  = [el];
        modifier.apply(this, ctx.concat(args));
      });
      return this;
    };
    this[name].displayName = 'modifier';
    this._modifiers[name]  = modifier;

    return this;
  };
  BaseStream.prototype._defineAll = function(tags, modifiers){
    for(var fn in tags){
      if(tags.hasOwnProperty(fn) && tags[fn] && !this._tags[fn]){
        this.defineTag(fn, tags[fn]);
      }
    }

    for(fn in modifiers){
      if(modifiers.hasOwnProperty(fn) && modifiers[fn] && !this._modifiers[fn]){
        this.defineModifier(fn, modifiers[fn]);
      }
    }

    return this;
  };
  
  // ----- Control flow -------------------------------------------------------

  /**
   * Make edits to the stream for each item in an array
   */
  BaseStream.prototype.each = abstract_method;
  /**
   * Make edits to the stream when the condition is true
   */
  BaseStream.prototype.$if  = abstract_method;
  /**
   * Make edits to the stream when the condition in the corresponding 'if' call
   * is false. Only defined for $if branches
   */
  BaseStream.prototype.$else = undefined;
  
  // ----- Utility ------------------------------------------------------------
  
  /**
   * Set the data bound to this stream
   */
  BaseStream.prototype.data = function(data){
    this._context.data  = data;
    return this;
  };
  /**
   * Set the index bound to this stream
   */
  BaseStream.prototype.index = function(index){
    this._context.index = index;
    return this;
  };
  /**
   * Accepts an argument capable of yielding a value.
   * the given argument can be any of the following: 
   *     A raw value:     value
   *     A function:      (data,index) -> value
   *     A function:      (data,index) -> Observable value
   *     An observable:   Observable value
   * Returns an observable value
   */
  BaseStream.prototype.eval = function(value, once){
    if(typeof value === 'function'){
      value = this._context.eval(value);
    }
    if(!once){
      return asProperty(value).takeUntil(this._clear);
    }
    return value;
  };
  /**
   * Call a callback with the current context (data and index),
   * exposing the underlying DOM element as 'this'
   */
  BaseStream.prototype.call = abstract_method;
  
  // ----- Builder Methods -----------------------------------------------------

  /**
   * Append the contents to the current element
   */
  BaseStream.prototype.append = abstract_method;
  /**
   * Append the contents to the current element, and open the added element for
   * further editing
   */
  BaseStream.prototype.open   = abstract_method;
  /**
   * Remove all child elements that were created by this stream
   */
  BaseStream.prototype.clear  = abstract_method;
  /**
   * Register a callback to be called when this element is deleted
   */
  BaseStream.prototype.onClear = abstract_method;
  /**
   * Sets the parent stream.
   * The parent is returned by the method 'close' for convenient chaining
   */
  BaseStream.prototype.parent = function(parent){
    this._parent = parent;
    this._defineAll(parent._tags, parent._modifiers);
    this._clear.plug(parent._clear);
    return this;
  };
  /**
   * Return the parent stream
   */
  BaseStream.prototype.close  = function(){
    return this._parent;
  };
  /**
   * Return a string representation of this stream
   */
  BaseStream.prototype.toString = function(){
    var string = [];
    if(this._parent){ string.push(this._parent.toString()); }
    if(this._name)  { string.push(this._name); }
    return string.join('.');
  };

  /////////////////////////////////////////////////////////////////////////////
  // SINGLE ELEMENT STREAM
  /////////////////////////////////////////////////////////////////////////////
  function ElementStream(element, context, cursor){
    this._el      = element;
    this._context = context;
    this._cursor  = cursor;
    this._init();
  }
  ElementStream.prototype = new BaseStream();
  ElementStream.prototype._init = function(){
    if(!this._cursor){
      this._cursor = new Cursor();
      this._cursor.open(this._el);
    }
    BaseStream.prototype._init.call(this);
  };
  // ----- Control flow -------------------------------------------------------
  ElementStream.prototype.each = function(array){
    var stream = this;
    var eachCursor = stream._cursor.clone();
    
    var eventedStream = new EventedStream(this.eval(array).map(function(array){
      var arrayStream = new ArrayStream(array.map(function(d,i){
        var context = new Context(d,i);
        var element = stream._el;
        var cursor  = eachCursor.clone();
        return new ElementStream(element, context, cursor).parent(stream);
      }), stream._context);
      arrayStream._name = 'each([' + array.toString() + '])';
      return arrayStream.parent(stream);
    }), stream._context);
    eventedStream._name = 'each([' + array.toString() + '])';
    return eventedStream.parent(stream);
  };
  ElementStream.prototype.$if  = function(condition){
    var stream   = this;
    var ifCursor = this._cursor.clone();
    
    condition = this.eval(condition);

    var trueStream = condition.map(function(c){
      var context = stream._context;
      var element = stream._el;
      var cursor  = ifCursor.clone();
      
      return c ? new ElementStream(element, context, cursor).parent(stream) : new EventedStream(Bacon.never(), context).parent(stream);
    });
    var falseStream = condition.not().map(function(c){
      var context = stream._context;
      var element = stream._el;
      var cursor  = ifCursor.clone();
      
      return c ? new ElementStream(element, context, cursor).parent(stream) : new EventedStream(Bacon.never(), context).parent(stream);
    });

    var conditional = new EventedStream(trueStream, trueStream._context);
    conditional._name = '$if(' + condition.toString() + ')';
    conditional.$else = function(){
      var eventedStream = new EventedStream(falseStream, falseStream._context);
      eventedStream._name = '$if(' + condition.toString() + '):$else()';
      return eventedStream.parent(this._parent);
    };

    return conditional.parent(this);
  };
  // ----- Utility ------------------------------------------------------------
  ElementStream.prototype.call = function(callback){
    callback.call(this, this._el, this._context.data, this._context.index);
    return this;
  };
  // ----- Builder Methods -----------------------------------------------------
  ElementStream.prototype.append = function(content){
    this._cursor.write(content);
    return this;
  };
  ElementStream.prototype.open = function(content){
    if($spice.debug){ $(content).data('spice', getStack()); }
    this.append(content);
    var stream = new ElementStream(content, this._context);
    return stream.parent(this);
  };
  ElementStream.prototype.clear = function(){
    this._clear.push({});
    this._cursor.clear();
    return this;
  };
  ElementStream.prototype.onClear = function(callback){
    this._clear.onValue(function(){ this.call(callback); }.bind(this));
  };

  /////////////////////////////////////////////////////////////////////////////
  // MULTIPLE ELEMENT STREAMS
  /////////////////////////////////////////////////////////////////////////////
  function ArrayStream(streams, context){
    this._streams = streams;
    this._context = context;
    this._init();
  }
  ArrayStream.prototype = new BaseStream();
  // ----- Control flow -------------------------------------------------------
  ArrayStream.prototype.each = function(array){
    var arrayStream = new ArrayStream(this._streams.map(function(s){
      return s.each(array);
    }), this._context);
    arrayStream._name = 'each([' + array.toString() + '])';
    return arrayStream.parent(this);
  };
  ArrayStream.prototype.$if = function(condition){
    var conditional = new ArrayStream(this._streams.map(function(s){
      return s.$if(condition);
    }), this._context);
    conditional._name = '$if(' + condition.toString() + ')';

    conditional.$else = function(){
      var arrayStream = new ArrayStream(this._streams.map(function(s){
        return s.$else();
      }), this._context);
      arrayStream._name = '$if(' + condition.toString() + '):$else()';
      return arrayStream.parent(this._parent);
    };

    return conditional.parent(this);
  };
  // ----- Utility ------------------------------------------------------------
  ArrayStream.prototype.call = function(callback){
    this._streams.forEach(function call(s){ s.call(callback); });
    return this;
  };
  // ----- Builder Methods -----------------------------------------------------
  ArrayStream.prototype.append = function(content){
    this._streams.forEach(function(s){
      s.append(content);
    });
    return this;
  };
  ArrayStream.prototype.open = function(content){
    return new ArrayStream(this._streams.map(function(s){
      var clone = $(content).clone()[0];
      return s.open(clone);
    }), this._context).parent(this);
  };
  ArrayStream.prototype.clear = function(){
    this._streams.forEach(function(s){
      s.clear();
    });
    return this;
  };
  ArrayStream.prototype.onClear = function(callback){
    this._streams.forEach(function(s){
      s.onClear(callback);
    });
    return this;
  };

  /////////////////////////////////////////////////////////////////////////////
  // BACON-POWERED STREAMS
  /////////////////////////////////////////////////////////////////////////////
  function EventedStream(event, context){
    this._event   = event;
    this._context = context;
    this._init();
  }
  EventedStream.prototype = new BaseStream();
  EventedStream.prototype._init = function(){
    this._event.onValue(noop);
    //Clear old streams as new ones arrive
    this._event.slidingWindow(2)
      .doAction(function(streams){
        if(streams[0] && streams[1]){ streams[0].clear(); }
      })
      .onValue(noop);

    BaseStream.prototype._init.call(this);
  };
  // ----- Control flow -------------------------------------------------------
  EventedStream.prototype.each = function(array){
    var eventedStream = new EventedStream(this._event.map(function(stream){
      return stream.each(array);
    }));
    eventedStream._name = 'each([' + array.toString() + '])';
    return eventedStream.parent(this);
  };
  EventedStream.prototype.$if  = function(condition){
    var conditional = new EventedStream(this._event.map(function(stream){
      return stream.$if(condition);
    }), this._context);
    conditional._name = '$if(' + condition.toString() + ')';

    conditional.$else = function(){
      var eventedStream = new EventedStream(this._event.map(function(stream){
        return stream.$else();
      }), this._context);
      eventedStream._name = '$if(' + condition.toString() + '):$else()';
      return eventedStream.parent(this._parent);
    };

    return conditional.parent(this);
  };
  // ----- Utility ------------------------------------------------------------
  EventedStream.prototype.call = function(callback){
    this._event.onValue(function call(stream){
      stream.call(callback);
    });
    return this;
  };
  // ----- Builder Methods ----------------------------------------------------
  EventedStream.prototype.append = function(content){
    this._event.onValue(function(stream){
      stream.append(content);
    });
    return this;
  };
  EventedStream.prototype.open = function(content){
    return new EventedStream(this._event.map(function(stream){
      return stream.open(content);
    }), this._context).parent(this);
  };
  EventedStream.prototype.clear = function(){
    this._event.onValue(function(stream){
      stream.clear();
    });
    return this;
  };
  EventedStream.prototype.onClear = function(callback){
    this._event.onValue(function(stream){
      stream.onClear(callback);
    });
    return this;
  };


  /////////////////////////////////////////////////////////////////////////////
  // EXPORTS
  /////////////////////////////////////////////////////////////////////////////
  var $spice = function(element){
    var stream = new ElementStream(element, new Context());

    return stream;
  };
  $spice.select = function(selector){
    var streams = $(selector).toArray()
      .map(function(el){
        return $spice(el);
      });
    var arrayStream = new ArrayStream(streams, new Context());
    arrayStream._name = '$spice.select("' + selector + '")';

    return arrayStream;
  };
  $spice.defineTag = function(name, tag){
    tag.displayName = tag.displayName || name;
    BaseStream.prototype[name] = function(){
      var args  = [].slice.call(arguments);
      var child = tag.apply(this, args);
      child._name = name + '(' + args.map(function(a){ return a.toString(); }).join(',') + ')';
      return child.parent(this);
    };
    BaseStream.prototype[name].displayName = 'tag';
    return $spice;
  };
  $spice.defineModifier = function(name, modifier){
    modifier.displayName = modifier.displayName || name;
    BaseStream.prototype[name] = function(){
      var args   = [].slice.call(arguments);
      this.call(function applyModifier(el){
        var ctx  = [el];
        modifier.apply(this, ctx.concat(args));
      });
      return this;
    };
    BaseStream.prototype[name].displayName = 'modifier';
    return $spice;
  };

  $spice.VERSION = '0.6.8';
  $spice.debug   = false;
  root.$spice    = $spice;

})(this, window.jQuery, window.Bacon);

//Extensions
(function($spice, $, Bacon){
  'use strict';

  /////////////////////////////////////////////////////////////////////////////
  // MODIFIERS
  /////////////////////////////////////////////////////////////////////////////
  $spice.defineModifier('attrs', function(el, attr_map){
    var stream = this;

    for(var attr_name in attr_map){
      if(attr_map.hasOwnProperty(attr_name) && attr_map[attr_name]){
        stream.attr(attr_name, attr_map[attr_name]);
      }
    }
  });
  $spice.defineModifier('classed', function(el, class_map){
    for(var class_name in class_map){
      if(class_map.hasOwnProperty(class_name) && class_map[class_name]){
        var set = setClass(class_name);
        this.eval(class_map[class_name]).onValue(set);
      }
    }
    function setClass(name){
      return function(on){
        if(on){
          $(el).addClass(name);
        } else {
          $(el).removeClass(name);
        }
      };
    }
  });
  $spice.defineModifier('attr', function(el, attr_name, attr_value){
    this.eval(attr_value).onValue(function(value){
      $(el).attr(attr_name, value);
    });
  });
  $spice.defineModifier('text', function(el, text){
    var textNode = document.createTextNode('');
    this.append(textNode);

    this.eval(text).onValue(function(text){
      textNode.textContent = text;
    });
  });
  $spice.defineModifier('addClass', function(el, class_name){
    this.eval(class_name).onValue(function(class_name){
      $(el).addClass(class_name);
    });
  });

  //Attributes
  var attrs = [ 'href', 'id', 'name', 'placeholder', 'src', 'title', 'type', 'value' ];

  attrs.forEach(function(attrName){
    $spice.defineModifier(attrName, attribute(attrName));
  });
  $spice.defineModifier('$class', attribute('class'));

  function attribute(attrName){
    return function(el, value){
      return this.attr(attrName, value);
    };
  }


  /////////////////////////////////////////////////////////////////////////////
  // TAGS
  /////////////////////////////////////////////////////////////////////////////
  var tags = [ 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio'                                                       //A
             , 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button',                                                  //B
             , 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup'                                                            //C
             , 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt'                                            //D
             , 'em', 'embed'                                                                                                     //E
             , 'fieldset', 'figcaption', 'figure', 'footer', 'form'                                                              //F
                                                                                                                                 //G
             , 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'html', 'hr'                                      //H
             , 'i', 'iframe', 'img', 'input', 'ins'                                                                              //I
                                                                                                                                 //J
             , 'kbd', 'keygen'                                                                                                   //K
             , 'label', 'legend', 'li', 'link'                                                                                   //L
             , 'map', 'mark', 'menu', 'meta', 'meter'                                                                            //M
             , 'nav', 'noscript'                                                                                                 //N
             , 'object', 'ol', 'optgroup', 'option', 'output'                                                                    //O
             , 'p', 'param', 'pre', 'progress'                                                                                   //P
             , 'q'                                                                                                               //Q
             , 'rp', 'rt', 'ruby'                                                                                                //R
             , 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup' //S
             , 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track'                        //T
             , 'u', 'ul'                                                                                                         //U
             , 'var', 'video'                                                                                                    //V
             , 'wbr'                                                                                                             //W
                                                                                                                                 //X
                                                                                                                                 //Y
                                                                                                                                 //Z
             ];

  tags.forEach(function(tagName){
    $spice.defineTag(tagName, tag(tagName));
  });

  function tag(tagName){
    return function(attrs){
      var tag = document.createElement(tagName);
      var stream = this.open(tag);
      if(attrs){ stream.attrs(attrs); }
      return stream;
    };
  }

})(window.$spice, window.jQuery, window.Bacon);
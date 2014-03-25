(function($, Bacon){
  'use strict';

  function abstract_method(){ throw 'abstract method'; }
  function id(x){ return x; }
  function noop(){}

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
    this._$el = $(document.createElement('script'));
  }
  Cursor.prototype.open  = function(el){
    this._$el.appendTo(el);
  };
  Cursor.prototype.close = function(){
    this._$el.remove();
  };
  Cursor.prototype.write = function(content){
    this._$el.before(content);
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
  };
  /**
   * Register a function as a tag writer for this stream
   */
  BaseStream.prototype.defineTag = function(name, tag){
    this[name] = function(){
      var args = [].slice.call(arguments),
          ctx  = [this._context.data, this._context.index];
      return tag.apply(this, ctx.concat(args)).parent(this);
    };
    this._tags[name] = tag;

    return this;
  };
  /**
   * Register a function as a attribute modifier for this stream
   */
  BaseStream.prototype.defineModifier = function(name, modifier){
    this[name] = function(){
      var args   = [].slice.call(arguments);
      this.call(function(el){
        var ctx  = [el];
        modifier.apply(this, ctx.concat(args));
      });
      return this;
    };
    this._modifiers[name] = modifier;

    return this;
  };
  BaseStream.prototype._defineAll = function(tags, modifiers){
    for(var fn in tags){
      if(tags.hasOwnProperty(fn) && tags[fn]){
        this.defineTag(fn, tags[fn]);
      }
    }

    for(fn in modifiers){
      if(modifiers.hasOwnProperty(fn) && modifiers[fn]){
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
  BaseStream.prototype.$if  = function(condition){
    return new ConditionalStream(this, this.eval(condition), this._context).parent(this);
  };
  BaseStream.prototype._if = BaseStream.prototype.$if;
  /**
   * Make edits to the stream when the condition in the corresponding 'if' call
   * is false. Only defined for _if branches
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
  BaseStream.prototype.eval = function(value){
    if(typeof value === 'function'){
      return this.eval(this._context.eval(value));
    } else if(value instanceof Bacon.Observable){
      return value;
    } else {
      return Bacon.once(value).delay(0);
    }
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
   * Sets the parent stream.
   * The parent is returned by the method 'close' for convenient chaining
   */
  BaseStream.prototype.parent = function(parent){
    this._parent = parent;
    this._defineAll(parent._tags, parent._modifiers);
    return this;
  };
  BaseStream.prototype.bindClose = BaseStream.prototype.parent;
  /**
   * Return the parent stream
   */
  BaseStream.prototype.close  = function(){
    return this._parent;
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
    
    return new EventedStream(this.eval(array).map(function(array){
      return new ArrayStream(array.map(function(d,i){
        var context = new Context(d,i);
        var element = stream._el;
        var cursor  = eachCursor.clone();
        return new ElementStream(element, context, cursor).parent(stream);
      }), stream._context).parent(stream);
    }), stream._context).parent(stream);
  };
  // ----- Utility ------------------------------------------------------------
  ElementStream.prototype.call = function(callback){
    callback.call(this, this._el, this._context.data, this._context.index);
  };
  // ----- Builder Methods -----------------------------------------------------
  ElementStream.prototype.open = function(content){
    this.append(content);
    return new ElementStream(content, this._context).parent(this);
  };
  ElementStream.prototype.append = function(content){
    this._cursor.write(content);
    return this;
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
    return new ArrayStream(this._streams.map(function(s){
      return s.each(array);
    }), this._context);
  };
  // ----- Utility ------------------------------------------------------------
  ArrayStream.prototype.call = function(callback){
    this._streams.forEach(function(s){ s.call(callback); });
    return this;
  };
  // ----- Builder Methods -----------------------------------------------------
  ArrayStream.prototype.open = function(content){
    return new ArrayStream(this._streams.map(function(s){
      var clone = $(content).clone()[0];
      return s.open(clone);
    }), this._context).parent(this);
  };
  ArrayStream.prototype.append = function(content){
    this._streams.forEach(function(s){
      s.append(content);
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
    BaseStream.prototype._init.call(this);
  };
  // ----- Control flow -------------------------------------------------------
  EventedStream.prototype.each = function(array){
    return new EventedStream(this._event.map(function(stream){
      return stream.each(array);
    })).parent(this);
  };
  EventedStream.prototype.$if  = function(condition){
    return new EventedStream(this._event.map(function(stream){
      return stream.$if(condition);
    }), this._context).parent(this);
  };
  EventedStream.prototype._if = EventedStream.prototype.$if;
  // ----- Utility ------------------------------------------------------------
  EventedStream.prototype.call = function(callback){
    this._event.onValue(function(stream){
      stream.call(callback);
    });
    return this;
  };
  // ----- Builder Methods ----------------------------------------------------
  EventedStream.prototype.open = function(content){
    return new EventedStream(this._event.map(function(stream){
      return stream.open(content);
    }), this._context).parent(this);
  };
  EventedStream.prototype.append = function(content){
    this._event.onValue(function(stream){
      stream.append(content);
    });
    return this;
  };



  /////////////////////////////////////////////////////////////////////////////
  // CONDITIONAL STREAMS
  /////////////////////////////////////////////////////////////////////////////
  function ConditionalStream(stream, condition, context){
    this._trues       = condition.filter(id).map(stream);
    this._falses      = condition.not().filter(id).map(stream);
    this._event       = this._trues;
    this._context     = context;

    this._init();
  }
  ConditionalStream.prototype = new EventedStream(Bacon.never());
  // ----- Control flow -------------------------------------------------------
  ConditionalStream.prototype.$else = function(){
    return new EventedStream(this._falses, this._context);
  };
  ConditionalStream.prototype._else = ConditionalStream.prototype.$else;



  /////////////////////////////////////////////////////////////////////////////
  // EXPORTS
  /////////////////////////////////////////////////////////////////////////////
  var $spice = function(element){
    var stream = new ElementStream(element, new Context())
      ._defineAll($spice.tags, $spice.modifiers);

    return stream;
  };
  $spice.select = function(selector){
    var streams = $(selector).toArray()
      .map(function(el){
        return $spice(el);
      });
    var arrayStream = new ArrayStream(streams, new Context())
      ._defineAll($spice.tags, $spice.modifiers);

    return arrayStream;
  };
  $spice.modifiers = {};
  $spice.tags      = {};

  window.$spice = $spice;

})(window.jQuery, window.Bacon);

//Extensions
(function($spice, $, Bacon){
  'use strict';

  function withProperties(callback){
    var stream = this;
    var props  = [].slice.call(arguments, 1);
    
    Bacon.zipAsArray(props.map(stream.eval.bind(stream)))
      .onValue(function(array){
        callback.apply(this, array);
      });

    return stream;
  }

  /////////////////////////////////////////////////////////////////////////////
  // MODIFIERS
  /////////////////////////////////////////////////////////////////////////////
  $spice.modifiers.attrs = function(el, attr_map){
    var stream = this;

    for(var attr_name in attr_map){
      if(attr_map.hasOwnProperty(attr_name) && attr_map[attr_name]){
        stream.attr(attr_name, attr_map[attr_name]);
      }
    }
  };
  $spice.modifiers.classed = function(el, class_map){
    for(var class_name in class_map){
      if(class_map.hasOwnProperty(class_name) && class_map[class_name]){
        withProperties.call(this, setClass, class_name, class_map[class_name]);
      }
    }
    function setClass(name, on){
      if(on){
        $(el).addClass(name);
      } else {
        $(el).removeClass(name);
      }
    }
  };
  $spice.modifiers.attr = function(el, attr_name, attr_value){
    withProperties.call(this, function(value){
      $(el).attr(attr_name, value);
    }, attr_value);
  };
  $spice.modifiers.text = function(el, text){
    var textNode = document.createTextNode('');
    this.append(textNode);

    withProperties.call(this, function(text){
      textNode.textContent = text;
    }, text);
  };
  $spice.modifiers.addClass = function(el, class_name){
    withProperties.call(this, function(class_name){
      $(el).addClass(class_name);
    }, class_name);
  };

  //Attributes
  var attrs = [ 'href', 'id', 'name', 'placeholder', 'src', 'title', 'type', 'value' ];

  attrs.forEach(function(attrName){
    $spice.modifiers[attrName] = attribute(attrName);
  });
  $spice.modifiers.$class = attribute('class');
  $spice.modifiers._class = $spice.modifiers.$class;

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
    $spice.tags[tagName] = tag(tagName);
  });

  function tag(tagName){
    return function(){
      var tag = document.createElement(tagName);
      return this.open(tag);
    };
  }

})(window.$spice, window.jQuery, window.Bacon);
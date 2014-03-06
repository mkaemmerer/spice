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
	};
	Context.prototype.eval = function(callback){
		callback(this.data, this.index);
	};


	/////////////////////////////////////////////////////////////////////////////
	// ABSTRACT BASE CLASS
	/////////////////////////////////////////////////////////////////////////////
	function BaseStream(){
	}
	BaseStream.prototype._init = function(){
		if(!$spice) return;

		for(var fn in $spice.tags){
			if($spice.tags.hasOwnProperty(fn) && $spice.tags[fn]){
				this[fn] = delegateTag($spice.tags[fn]);
			}
		}

		for(fn in $spice.modifiers){
			if($spice.modifiers.hasOwnProperty(fn) && $spice.modifiers[fn]){
				this[fn] = delegateModifier($spice.modifiers[fn]);
			}
		}
		
		function delegateTag(tag){
			return function(){
				var args = [].slice.call(arguments),
				    ctx  = [this._context.data, this._context.index];
				return tag.apply(this, ctx.concat(args)).parent(this);
			}
		}
		function delegateModifier(modifier){
			return function(){
				var stream = this;
				var args   = [].slice.call(arguments);

				this.call(function(){
					var ctx  = [stream._context.data, stream._context.index];
					modifier.apply(this, ctx.concat(args));
				});

				return this;
			}
		}
	};
	
	// ----- Control flow -------------------------------------------------------
	BaseStream.prototype.each = function(array){
		var stream = this;
		
		return new EventedStream(this.eval(array).map(function(array){
			return new ArrayStream(array.map(function(d,i){
				var context = new Context(d,i);
				var element = undefined; //TODO????
				return new ElementStream(element, context);
			}), this._context);
		}), this._context);
	};
	/**
	 * Make edits to the stream when the condition is true
	 */
	BaseStream.prototype.$if  = function(condition){
		return new ConditionalStream(this, this.eval(condition), this._context);
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
			return Bacon.once(value);
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
	function ElementStream(element, context){
		this._el      = element;
		this._context = context;
		this._init();
	}
	ElementStream.prototype = new BaseStream();
	// ----- Utility ------------------------------------------------------------
	ElementStream.prototype.call = function(callback){
		callback.call(this._el);
	};
	// ----- Builder Methods -----------------------------------------------------
	ElementStream.prototype.open = function(content){
		this.append(content);
		return new ElementStream(content, this._context).parent(this);
	};
	ElementStream.prototype.append = function(content){
		$(this._el).append(content);
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
	// ----- Utility ------------------------------------------------------------
	ArrayStream.prototype.call = function(callback){
		this._streams.forEach(function(s){ s.call(callback); });
		return this;
	};
	// ----- Builder Methods -----------------------------------------------------
	ArrayStream.prototype.open = function(content){
		var stream = this;
		return new ArrayStream(this._streams.map(function(s){
				var clone = $(content).clone()[0];
				return s.open(clone).parent(stream);
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
		this._event = event.onValue(noop);
		this._context = context;
		this._init();
	}
	EventedStream.prototype = new BaseStream();
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
		return new ElementStream(element, new Context());
	};
	$spice.select = function(selector){
		//TODO
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
	$spice.modifiers.attrs = function(d, i, attr_map){
		var stream = $spice(this).data(d).index(i);

		for(var attr_name in attr_map){
			if(attr_map.hasOwnProperty(attr_name) && attr_map[attr_name]){
				stream.attr(attr_name, attr_map[attr_name]);
			}
		}
	};
	$spice.modifiers.classed = function(d, i, class_map){
		var el     = this;
		var stream = $spice(this).data(d).index(i);

		for(var class_name in class_map){
			if(class_map.hasOwnProperty(class_name) && class_map[class_name]){
				withProperties.call(stream, setClass, class_name, class_map[class_name]);
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
	$spice.modifiers.attr = function(d, i, attr_name, attr_value){
		var el     = this;
		var stream = $spice(this).data(d).index(i);

		withProperties.call(stream, function(value){
			$(el).attr(attr_name, value);
		}, attr_value);
	};
	$spice.modifiers.text = function(d, i, text){
		var el     = this;
		var stream = $spice(this).data(d).index(i);

		withProperties.call(stream, function(text){
			$(el).append(text);
		}, text);
	};
	$spice.modifiers.addClass = function(d, i, class_name){
		var el     = this;
		var stream = $spice(this).data(d).index(i);

		withProperties.call(stream, function(class_name){
			$(el).addClass(class_name);
		}, class_name);
	};

	//Attributes
	var attrs = [ 'href', 'id', 'name', 'placeholder', 'src', 'title', 'type', 'value' ];

	attrs.forEach(function(attrName){
		$spice.modifiers[attrName] = attribute(attrName);
	});
	$spice.modifiers.$class = attribute("class");
	$spice.modifiers._class = $spice.modifiers.$class;

	function attribute(attrName){
		return function(d, i, value){
			return $spice(this).data(d).index(i).attr(attrName, value);
		};
	}


	/////////////////////////////////////////////////////////////////////////////
	// TAGS
	/////////////////////////////////////////////////////////////////////////////
	var tags = [ 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio'                                                       //A
	           , 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br'                                                             //B
	           , 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup'                                                            //C
	           , 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt'                                            //D
	           , 'em', 'embed'                                                                                                     //E
	           , 'fieldset', 'figcaption', 'figure', 'footer', 'form'                                                              //F
	                                                                                                                               //G
	           , 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'html', 'hr'                                      //H
	           , 'i', 'iframe', 'img', 'input', 'ins',                                                                             //I
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
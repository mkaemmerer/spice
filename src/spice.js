(function($, Bacon){
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
		for(var fn in $spice.tags){
			if($spice.tags.hasOwnProperty(fn) && $spice.tags[fn]){
				this[fn] = delegateTag($spice.tags[fn]);
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
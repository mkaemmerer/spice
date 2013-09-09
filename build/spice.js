window.$spice = 
(function($){
	function $spice_mixin_plugins(stream, context){
		for(var method in $spice.fn){
			if($spice.fn.hasOwnProperty(method) && $spice.fn[method]){
				stream[method] = delegateMethod(method)
			}
		}

		function delegateMethod(method){
			return function(){
				return $spice.fn[method].call(stream, stream, context.data(), context.index())
			}
		}
	}
	
	//BASE
	var baseStream = function(context){
		var stream = {}

		stream.data = function(d){
			if(!arguments.length) return context.data()
			context.data(d)
			return stream
		}
		stream.eval = function(value){
			if(typeof value === "function")
				return value.call(context.result(), context.data(), context.index())
			return value
		}
		stream.call = function(callback){
			callback.call(context.result(), context.data(), context.index())
			return stream
		}
		stream.append = function(content){
			context.push(content)
			return stream
		}
		stream.open = function(content){
			var new_context = elementContext(content, context.data(), context.index())
			  , new_stream  = elementStream(new_context)
			stream.append(content)
			return new_stream.bindClose(stream)
		}
		stream.each = function(array){
			var streams
			  , new_stream

			array = stream.eval(array)
			streams = array.map(function(d, i){
				var result = context.result()
				if($.isArray(result)){
					return topLevelStream(topLevelContext(result, d, i))
				} else {
					return elementStream(elementContext(result, d, i))
				}
			})
			new_stream = arrayStream(streams, context)
			
			return new_stream.bindClose(stream)
		}
		stream._if  = function(condition){
			var new_stream = conditionalStream(stream.eval(condition), stream, context)
			return new_stream.bindClose(stream)
		}
		
		$spice_mixin_plugins(stream, context)

		return stream
	}

	//TOP LEVEL
	var topLevelContext = function(buffer, data, index){
		var context = {}
		buffer = buffer || []

		context.data = function(d){
			if(!arguments.length) return data
			data = d
			return context
		}
		context.index = function(){
			return index
		}
		context.push = function(content){
			buffer.push(content)
		}
		context.result = function(){
			return buffer
		}

		context.methods = {}

		return context
	}
	var topLevelStream = function(context){
		var stream = baseStream(context)

		stream.close = function(){
			return context.result()
		}

		return stream
	}

	//TAG
	var elementContext = function(element, data, index){
		var context  = {}
		  , buffer   = []
		  , $element = $(element)

		context.data = function(d){
			if(!arguments.length) return data
			data = d
			return context
		}
		context.index = function(){
			return index
		}

		context.push = function(content){
			buffer.push(content)
			$element.append(content)
		}
		context.result = function(){
			return element
		}

		context.methods = {
			  text: function(text){
					$element.append(text)
				}
			, attr: function(key, value){
					$element.attr(key, value)
				}
			, attrs: function(map){
					$element.attr(map)
				}
			, classed: function(classes){
					for(var className in classes){
						if(classes.hasOwnProperty(className) && classes[className])
							$element.addClass(className)
					}
				}
		}

		return context
	}
	var elementStream = function(context){
		var stream = baseStream(context)
		  , parent

		stream.bindClose = function(p){
			parent = p
			return stream
		}
		stream.close = function(){
			return parent
		}

		stream.text = function(text){
			text = stream.eval(text)
			context.methods.text(text)
			return stream
		}
		stream.attr = function(key, value){
			value = stream.eval(value)
			context.methods.attr(key, value)
			return stream
		}
		stream.attrs = function(map){
			map = stream.eval(map)
			context.methods.attrs(map)
			return stream
		}
		stream.classed = function(classes){
			classes = stream.eval(classes)
			context.methods.classed(classes)
			return stream
		}

		return stream
	}

	//EACH
	var arrayStream = function(streams, context){
		var stream = {}
		  , parent

		stream.open = function(content){
			var ss = streams.map(function(s){
						var clone = $(content).clone()[0]
						return s.open(clone)
					})
			  , new_context = elementContext(content, context.data(), context.index())
			  , new_stream  = arrayStream(ss, new_context)

			return new_stream.bindClose(stream)
		}

		stream.bindClose = function(p){
			parent = p
			return stream
		}
		stream.close = function(){
			return parent
		}

		var methods = ["each", "_if"]
		methods.forEach(function(method){
			stream[method] = delegateMethod(method)
		})
		var mutators = ["call", "append"]
		mutators.forEach(function(method){
			stream[method] = delegateMutator(method)
		})

		//CONTEXT HELPERS
		for(var method in context.methods){
			if(context.methods.hasOwnProperty(method)){
				stream[method] = delegateMutator(method)
			}
		}

		function delegateMutator(method){
			return function(){
				var args = arguments
				streams.forEach(function(s){
					s[method].apply(s,args)
				})
				return stream
			}			
		}
		function delegateMethod(method){
			return function(){
				var args = arguments
				  , ss = streams.map(function(s){
							return s[method].apply(s, args)
						})
				  , new_stream = arrayStream(ss, context)

				return new_stream.bindClose(stream)
			}
		}

		$spice_mixin_plugins(stream, context)

		return stream
	}

	//IF
	var nullStream = function(context){
		return arrayStream([], context)
	}
	var delegateStream = function(original, context){
		var stream = {}
		  , parent

		var methods = ["each", "open", "append"]
		methods.forEach(function(method){
			stream[method] = function(){
				var new_stream = original[method].apply(original, arguments)
				return new_stream.bindClose(stream)
			}
		})

		var mutators = ["data", "call"]
		mutators.forEach(function(method){
			stream[method] = function(){
				original[method].apply(original, arguments)
				return stream
			}
		})

		stream.bindClose = function(p){
			parent = p
			return stream
		}
		stream.close = function(){
			return parent
		}

		stream.eval = function(){
			return original.eval.apply(original, arguments)
		}

		stream._if = function(condition){
			var new_stream = conditionalStream(stream.eval(condition), stream, context)
			return new_stream.bindClose(stream)
		}

		return stream
	}
	var conditionalStream = function(condition, original, context){
		var true_stream  = condition ? delegateStream(original, context) : nullStream(context)
		  , false_stream = condition ? nullStream(context) : delegateStream(original, context)
		  , parent

		$spice_mixin_plugins(true_stream, context)
		$spice_mixin_plugins(false_stream, context)

		true_stream._else = function(){
			return false_stream.bindClose(original)
		}

		return true_stream.bindClose(original)
	}

	$spice = function(element){
		if(element)
			return topLevelStream(elementContext(element))
		return topLevelStream(topLevelContext())
	}
	$spice.select = function(selector){
		var element = $(selector)[0]
		return topLevelStream(elementContext(element))
	}	
	$spice.fn = {}

	return $spice
})(window.$);
//Register HTML tags and attributes
(function($spice){
	//Tags
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
	           ]

	tags.forEach(function(tagName){
		$spice.fn[tagName] = tag(tagName)
	})

	function tag(tagName){
		return function(){
			var tag = document.createElement(tagName)
			return this.open(tag)
		}
	}


	//Attributes
	var attrs = [ 'href', 'id', 'name', 'placeholder', 'src', 'title', 'type', 'value' ]

	attrs.forEach(function(attrName){
		$spice.fn[attrName] = attribute(attrName)
	})
	$spice.fn["_class"] = attribute("class")

	function attribute(attrName){
		return function(value){
			return this.attr(attrName, value);
		}
	}
})(window.$spice)
window.$spice = 
(function($){
	function $spice_mixin_close(stream, parent){
		stream.close = function(){
			return parent
		}
		return stream
	}
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
			return $spice_mixin_close(new_stream, stream)
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
			
			return $spice_mixin_close(new_stream, stream)
		}
		stream._if  = function(condition){
			var new_stream = conditionalStream(stream.eval(condition), stream, context)
			return $spice_mixin_close(new_stream, stream)
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

		context.select = function(selector){
			return buffer.reduce(function(memo, el){
				return memo.add(el.find(selector))
			}, $())
		}
		context.selectAll = context.select
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

		stream.select = function(selector){
			var selection  = context.select(selector)
			  , streams    = selection.map(function(idx, el){
			  		var new_context = elementContext(el, context.data(), idx)
						return elementStream(new_context)
					})
			  , new_context = selection[0] ? elementContext(selection[0], context.data(), context.index()) : topLevelContext()
			  , new_stream  = arrayStream(streams, new_context)

			return $spice_mixin_close(new_stream, stream)
		}

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

		context.select = function(selector){
			return buffer.reduce(function(memo, el){
				return memo.add($(el).find(selector))
			}, $())
		}
		context.selectAll = function(selector){
			return $element.find(selector)
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

		stream.select = function(selector){
			var selection  = context.select(selector)
			  , streams    = selection.map(function(idx, el){
			  		var new_context = elementContext(el, context.data(), context.index())
						return elementStream(new_context)
					}).get()
			  , new_context = selection[0] ? elementContext(selection[0], context.data(), context.index()) : topLevelContext()
			  , new_stream  = arrayStream(streams, new_context)

			return $spice_mixin_close(new_stream, stream)
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

		stream.select = function(selector){
			var ss = streams.map(function(s, i){
						return s.select(selector)
					})
			  , selection   = context.selectAll(selector)
			  , new_context = selection[0] ? elementContext(selection[0], context.data(), context.index()) : topLevelContext()
			  , new_stream  = arrayStream(ss, new_context)

			return $spice_mixin_close(new_stream, stream)
		}

		stream.open = function(content){
			var ss = streams.map(function(s){
						var clone = $(content).clone()[0]
						return s.open(clone)
					})
			  , new_context = elementContext(content, context.data(), context.index())
			  , new_stream  = arrayStream(ss, new_context)

			return $spice_mixin_close(new_stream, stream)
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
				return $spice_mixin_close(new_stream, stream)
			}
		}

		$spice_mixin_plugins(stream, context)

		return stream
	}

	//IF
	var nullStream = function(context){
		return arrayStream([], context)
	}
	var delegateStream = function(parent, context){
		var stream = {}

		var methods = ["select", "each", "open", "append"]
		methods.forEach(function(method){
			stream[method] = function(){
				var new_stream = parent[method].apply(parent, arguments)
				return $spice_mixin_close(new_stream, stream)
			}
		})

		var mutators = ["data", "call"]
		mutators.forEach(function(method){
			stream[method] = function(){
				parent[method].apply(parent, arguments)
				return stream
			}
		})

		stream.eval = function(){
			return parent.eval.apply(parent, arguments)
		}

		stream._if = function(condition){
			var new_stream = conditionalStream(stream.eval(condition), stream, context)
			return $spice_mixin_close(new_stream, stream)
		}

		return stream
	}
	var conditionalStream = function(condition, parent, context){
		var true_stream  = condition ? delegateStream(parent, context) : nullStream(context)
		  , false_stream = condition ? nullStream(context) : delegateStream(parent, context)

		$spice_mixin_plugins(true_stream, context)
		$spice_mixin_plugins(false_stream, context)

		true_stream._else = function(){
			return $spice_mixin_close(false_stream, parent)
		}

		return true_stream
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
//Register HTML tags
(function($spice){
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
})(window.$spice)
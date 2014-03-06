//Extensions
(function($spice, $, Bacon){
	function withProperties = function(callback){
		var stream = this;
		var props  = [].slice.call(arguments, 1);
		
		Bacon.zipWith(props.map(stream.eval.bind(stream)), function(){
			callback.apply(arguments);
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

		withProperties.call(stream, function(value){
			$(el).append(text);
		});
	};
	$spice.modifiers.addClass = function(d, i, class_name){
		var el     = this;
		var stream = $spice(this).data(d).index(i);

		withProperties.call(stream, function(value){
			$(el).addClass(class_name);
		});
	};

	//Attributes
	var attrs = [ 'href', 'id', 'name', 'placeholder', 'src', 'title', 'type', 'value' ];

	attrs.forEach(function(attrName){
		$spice.modifiers[attrName] = attribute(attrName);
	});
	$spice.modifiers["_class"] = attribute("class");

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
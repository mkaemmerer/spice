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
		return function(stream, d, i, value){
			return this.attr(attrName, value);
		}
	}
})(window.$spice)
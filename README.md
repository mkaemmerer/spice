# Spice

**Spice** is a Domain Specific Language for creating DOM objects using a powerful and compact syntax.

For example, running this snippet

```
$spice(document.body)
	.ul().$class('striped')
		.each(['Ready...', 'Set...', 'Go!'])
			.li().text(function(d){ return d; }).close()
		.close()
	.close();
```

produces the following output

```
<body>
	<ul class="striped">
		<li>Ready...</li>
		<li>Set...</li>
		<li>Go!</li>
	</ul>
</body>
```



## Creating Elements

### $spice(element)
Wrapping an element with ```$spice(element)``` returns a "stream" which can be used to build DOM elements.

### stream\[tag name\]()
Create a new element as the child of the current element by calling the tag name as a function with no arguments.
Returns a stream of the new elements.

By default, ```$spice``` recognizes these tags:

* 'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio'
* 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button'
* 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup'
* 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt'
* 'em', 'embed'
* 'fieldset', 'figcaption', 'figure', 'footer', 'form'
* 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'html', 'hr'
* 'i', 'iframe', 'img', 'input', 'ins'
* 'kbd', 'keygen'
* 'label', 'legend', 'li', 'link'
* 'map', 'mark', 'menu', 'meta', 'meter'
* 'nav', 'noscript'
* 'object', 'ol', 'optgroup', 'option', 'output'
* 'p', 'param', 'pre', 'progress'
* 'q'
* 'rp', 'rt', 'ruby'
* 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup'
* 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track'
* 'u', 'ul'
* 'var', 'video'
* 'wbr'

### stream.text(string)
Appends ```string``` to the current elements as HTML-escaped text.



## Setting Attributes

### stream\[attribute name\](value)
Sets the attribute on the current elements to ```value```. Returns the stream.

By default, ```$spice``` recognizes these attributes:
* 'href', 'id', 'name', 'placeholder', 'src', 'title', 'type', 'value'

### stream.$class(value)
Set the class attribute on the current element. (This method is named ```$class``` to avoid conflict with the future reserved word ```class```). Returns the stream.

### stream.attr(name, value)
Set the attribute ```name``` to ```value``` on the current elements. Returns the stream.

### stream.attrs(attribute_map)
Sets multiple attributes on the current elements. Returns the stream.

### stream.addClass(class_name)
Adds ```class_name``` to the current elements' class attribute. Returns the stream.

### stream.classed(class_map)
Adds a class name for each key in the object ```class_map``` if the value of that key is truthy. Returns the stream.



## Control flow

### stream.append(element)
Append the element to the current element, and return the current stream.

### stream.open(element)
Append the element to the current element, and return a stream containing the *new* element.
Typically you will use the shorthand-methods ```stream.div()```, ```stream.span()```, etc. instead of using open directly.

### stream.close()
Returns this streams "parent" stream. This can be used to chain method calls in order to create multiple elements.
For example:
```
stream.ul()
	.li()
		.a().close()
	.close()
	.li()
		.a().close()
	.close()
.close()
```

### stream.$if(condition)
Returns a stream that will create new elements only if ```condition``` is true.

### stream.$else()
Returns a stream that will create new elements only if the condition in the corresponding ```if``` is false. (Can only be used after calling ```stream.if```).

### stream.each(array)
Returns a stream that will create elements in parallel -- one for each object in ```array```.



## Extending Spice

### stream.call(callback)
Calls ```callback``` with the stream as ```this```, and the current element as the first argument.
If there is a manipulation you want to be able to make to the DOM elements you are building that you can't accomplish with the existing methods in ```$spice```, you may find ```call``` useful.

### $spice.defineTag(name, method)
Register ```method``` as a custom tag called with ```name```. ```method``` should return a new stream. Its parent will be automatically set to the stream that is used to create it.
For example:
```
$spice.defineTag("my_button", function(){
	return this.button().$class('fancy-button');
});

stream
	.my_button()
		.text("click me")
	.close();
```

### $spice.defineModifier(name, method)
Register ```method``` as a custom attribute modifier called with ```name```. The first argument to ```method``` is the DOM element, any arguments passed when you call ```name``` will be passed to the method as well. The return value is ignored.
For example:
```
$spice.defineModifier('target', function(el, value){
	$(el).attr('data-target', value);
});

stream
	.div()
		.target('new-window')
	.close();
```

### stream.defineTag(name, method)
Similar to $spice.defineTag, but only defines the tag only within the scope of the current stream.

### stream.defineModifier(name, method)
Similar to $spice.defineModifier, but only defines the modifier only within the scope of the current stream.


Copyright (c) 2013-2014 Spiceworks Inc.
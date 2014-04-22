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
By working with DOM elements directly instead of cobbling HTML strings together, 

### stream[tag name]()
Create a new element as the child of the current element by calling the tag name as a function with no arguments.
Returns a stream of the newly created elements.

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

### stream[attribute name](value)
Sets the attribute on the current elements to ```value```.

By default, ```$spice``` recognizes these attributes:
* 'href', 'id', 'name', 'placeholder', 'src', 'title', 'type', 'value'

### stream.$class(value)
Set the class attribute on the current element. (This method is named ```$class``` to avoid conflict with the future reserved word ```class```).



## Setting Attributes

### stream.attr(name, value)
Set the attribute ```name``` to ```value``` on the current elements.

### stream.attrs(attribute_map)
Sets multiple attributes on the current elements.

### stream.addClass(class_name)
Adds ```class_name``` to the current elements' class attribute.

### stream.classed(class_map)
Adds a class name for each key in the object ```class_map``` if the value of that key is truthy.



## Control flow

### stream.if
### stream.each
### stream.open
### stream.append
### stream.close
### stream.call


## Extending Spice

### $spice.defineTag(name, method)

### $spice.defineModifier(name, method)

Copyright (c) 2013 Spiceworks Inc.
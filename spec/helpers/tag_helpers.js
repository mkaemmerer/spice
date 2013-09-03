TagMatchers = 
(function(){
	//Matchers
	function toMatchTag(expected){
		var errors = matchesTag(this.actual, expected, this.isNot)
		this.message = function(){ return errors.join("\n") }
		return errors.length == 0
	}
	function toMatchTagName(expected){
		var errors = matchesTagName(this.actual, expected, this.isNot)
		this.message = function(){ return errors.join("\n") }
		return errors.length == 0
	}
	function toMatchAttributes(expected){
		var errors = matchesAttributes(this.actual, expected, this.isNot)
		this.message = function(){ return errors.join("\n") }
		return errors.length == 0
	}
	function toMatchAttribute(expected, attr){
		var errors = matchesAttribute(attr, this.actual, expected, this.isNot)
		this.message = function(){ return errors.join("\n") }
		return errors.length == 0
	}


	//Checkers
	function matchesTag(actual, expected, not){
		var errors = []
		if(actual && expected){
			errors = errors.concat(matchesTagName(actual, expected, not))
			errors = errors.concat(matchesAttributes(actual, expected, not))
			errors = errors.concat(matchesDescendents(actual, expected, not))
		} else if(actual && !expected) {
			errors.push(makeMessage(actual, not, expected, actual))
		} else if(!actual && expected){
			errors.push(makeMessage(actual, not, expected, actual))
		}

		return errors
	}
	function matchesTagName(actual, expected, not){
		var errors  = []
		  , notText = not ? " not" : ""

		if(actual.tagName != expected.tagName)
			errors.push(makeMessage(actual, not, "a " + expected.tagName + " tag", "a " + actual.tagName + " tag"))
		
		return errors
	}
	function matchesAttributes(actual, expected, not){
		var actualAttributes   = getAttributeArray(actual)
		  , expectedAttributes = getAttributeArray(expected)
		  , allAttributes      = union(actualAttributes, expectedAttributes)
		  , errors = []
		
		allAttributes.forEach(function(attr){
			errors = errors.concat(matchesAttribute(attr, actual, expected, not))
		})

		return errors
	}
	function matchesAttribute(attr, actual, expected, not){
		var errors  = []
		  , notText = not ? " not" : ""

		if(actual.getAttribute(attr) != expected.getAttribute(attr))
			errors.push(makeMessage(actual + "'s " + attr, not, expected.getAttribute(attr), actual.getAttribute(attr)))

		return errors
	}
	function matchesDescendents(actual, expected, not){
		var actualChildren   = actual.children
		  , expectedChildren = expected.children
		  , errors          = []

		for(var i=0, len=Math.max(actualChildren.length, expectedChildren.length); i<len; i++){
			errors = errors.concat(matchesTag(actualChildren[i], expectedChildren[i], not))
		}

		return errors
	}

	//Utility
	function makeMessage(actualPart, not, expectedPart, butPart){
		var notPart = not ? " not" : ""
	    , message = "Expected " + actualPart + notPart + " to be " + expectedPart
		if(!not) message += ", but it was " + butPart
		return message
	}
	function getAttributeArray(tag){
		var attrs = []
		for(var i = 0, len = tag.attributes.length; i<len; i++){
			attrs.push(tag.attributes[i].name)
		}
		return attrs
	}
	function union(arr1, arr2){
		var union = []

		arr1.sort()
		arr2.sort()

		while(arr1.length && arr2.length){
			if (arr1[0] > arr2[0]){
				union.unshift(arr1.shift())
			} else if(arr1[0] < arr2[0]) {
				union.unshift(arr2.shift())
			} else {
				arr1.shift()
				union.unshift(arr2.shift())
			}
		}

		return union
	}

	return {
	  toMatchTag: toMatchTag
	, toMatchTagName: toMatchTagName
	, toMatchAttributes: toMatchAttributes
	, toMatchAttribute: toMatchAttribute
	}
})()
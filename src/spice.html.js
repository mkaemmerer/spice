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
  $spice.modifiers.attrs = function(el, d, i, attr_map){
    var stream = this;

    for(var attr_name in attr_map){
      if(attr_map.hasOwnProperty(attr_name) && attr_map[attr_name]){
        stream.attr(attr_name, attr_map[attr_name]);
      }
    }
  };
  $spice.modifiers.classed = function(el, d, i, class_map){
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
  $spice.modifiers.attr = function(el, d, i, attr_name, attr_value){
    withProperties.call(this, function(value){
      $(el).attr(attr_name, value);
    }, attr_value);
  };
  $spice.modifiers.text = function(el, d, i, text){
    var textNode = document.createTextNode('');
    this.append(textNode);

    withProperties.call(this, function(text){
      textNode.textContent = text;
    }, text);
  };
  $spice.modifiers.addClass = function(el, d, i, class_name){
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
    return function(el, d, i, value){
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
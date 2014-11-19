//Extensions
(function($spice, $, Bacon){
  'use strict';

  /////////////////////////////////////////////////////////////////////////////
  // MODIFIERS
  /////////////////////////////////////////////////////////////////////////////
  $spice.defineModifier('attrs', function(el, attr_map){
    var stream = this;

    for(var attr_name in attr_map){
      if(attr_map.hasOwnProperty(attr_name) && attr_map[attr_name]){
        stream.attr(attr_name, attr_map[attr_name]);
      }
    }
  });
  $spice.defineModifier('classed', function(el, class_map){
    for(var class_name in class_map){
      if(class_map.hasOwnProperty(class_name) && class_map[class_name]){
        var set = setClass(class_name);
        this.eval(class_map[class_name]).onValue(set);
      }
    }
    function setClass(name){
      return function(on){
        if(on){
          $(el).addClass(name);
        } else {
          $(el).removeClass(name);
        }
      };
    }
  });
  $spice.defineModifier('attr', function(el, attr_name, attr_value){
    this.eval(attr_value).assign($(el), 'attr', attr_name);
  });
  $spice.defineModifier('prop', function(el, prop_name, prop_value){
    this.eval(prop_value).assign($(el), 'prop', prop_name);
  });
  $spice.defineModifier('text', function(el, text){
    var textNode = document.createTextNode('');
    this.append(textNode);

    this.eval(text).onValue(function(text){
      textNode.textContent = text;
    });
  });
  $spice.defineModifier('addClass', function(el, class_name){
    this.eval(class_name).onValue(function(class_name){
      $(el).addClass(class_name);
    });
  });

  //Attributes
  var attrs = [ 'href', 'id', 'name', 'placeholder', 'src', 'title', 'type', 'value' ];

  attrs.forEach(function(attrName){
    $spice.defineModifier(attrName, attribute(attrName));
  });
  $spice.defineModifier('$class', attribute('class'));

  function attribute(attrName){
    return function(el, value){
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
    $spice.defineTag(tagName, tag(tagName));
  });

  function tag(tagName){
    return function(attrs){
      var tag = document.createElement(tagName);
      var stream = this.open(tag);
      if(attrs){ stream.attrs(attrs); }
      return stream;
    };
  }

})(window.$spice, window.jQuery, window.Bacon);
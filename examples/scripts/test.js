(function($spice, $){
  'use strict';

  var body = $('body');
  $spice(body[0])
    //Header section
    .section().$class('ui page grid')
      .div().$class('column')
        .h1().text('Tests').close()

        //Each with vanilla array
        .h3().text('Each with array').close()
        .each([1,2,3])
          .p().text(function(d){ return d; }).close()
          .p().text(function(d){ return d; }).close()
        .close()

        // //Each with events
        .h3().text('Each with events').close()
        .each(window.Bacon.fromArray([1,2,3]).scan([], '.concat'))
          .p().text(function(d){ return d; }).close()
          .p().text(function(d){ return d; }).close()
        .close()

        //If with vanilla boolean
        .h3().text('If/else with boolean').close()
        .$if(true)
          .p().text('true').close()
        .$else()
          .p().text('false').close()
        .close()

        // If with events
        .h3().text('If/else with events').close()
        .$if(Bacon.repeatedly(1000, [true, false]))
          .p().text('true').close()
        .$else()
          .p().text('false').close()
        .close()

      .close()
    .close();

})(window.$spice, window.$);
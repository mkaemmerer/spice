beforeEach(function(){
  jasmine.addMatchers(TagMatchers);
});


describe("Spice", function(){
  describe("from an element", function(){
    var env = {};

    beforeEach(function(){
      var el     = $('<div id="root">')[0];
      env.parent = null;
      env.tag    = $spice(el);
    });

    testInterface(env);
    testCreatesTags(env);
    testCreatesMultipleTags(env);
    testElement(env, 2);
    testIfBranch(env, 2);
    testEachLoop(env, 2);
  });

  describe("from a selector", function(){
    var env = {};

    beforeEach(function(){
      var el     = $('<div id="root">')[0];
      env.parent = null;
      env.tag    = $spice(el);
    });

    testInterface(env);
    testCreatesTags(env);
    testCreatesMultipleTags(env);
    testElement(env, 2);
    testIfBranch(env, 2);
    testEachLoop(env, 2);
  });

  describe("example cases", function(){
    var el;

    beforeEach(function(){
      el = document.createElement('div');
    });

    it("list builder", function(done){
      var expected = $('<ul>' +
        '<li>item0</li>' +
        '<li>item1</li>' +
        '<li>item2</li>' +
        '<li>item3</li>' +
        '<li>item4</li>' +
        '<li>item5</li>' +
        '</ul>');

      $spice(el)
        .ul()
          .each(["item", "item", "item", "item", "item", "item"])
            .li()
              .text(function(d,i){ return d + i; })
            .close()
          .close()
        .close();

      setTimeout(function(){
        expect(el.children[0]).toMatchTag(expected[0]);
        done();
      }, 100);
    });

    it("trucated collection", function(done){
      var expected = $('<ul>' +
        '<li>item0</li>' +
        '<li>item1</li>' +
        '<li>item2</li>' +
        '<li>item3</li>' +
        '<li>item4</li>' +
        '<li>item5</li>' +
        '<li>item6</li>' +
        '<li>item7</li>' +
        '<li>item8</li>' +
        '<li>item9</li>' +
        '</ul>');

      $spice(el)
        .ul()
          .each(["item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item"])
            .$if(function(d,i){ return i < 10; })
              .li()
                .text(function(d,i){ return d + i ;})
              .close()
            .close()
          .close()
        .close();

      setTimeout(function(){
        expect(el.children[0]).toMatchTag(expected[0]);
        done();
      }, 100);
    });
  });
});


//Interface
function testInterface(env){
  var tag,
      parent;

  beforeEach(function(){
    tag = env.tag;
    parent = env.parent;
  });

  it("can create loops", function(){
    expect(tag.each).toBeDefined();
  });

  it("can create conditional branches", function(){
    expect(tag.$if).toBeDefined();
  });

  it("can call helper functions", function(){
    expect(tag.call).toBeDefined();
  });

  it("returns the parent context when closed", function(){
    if(parent){
      expect(tag.close()).toBe(parent);
    }
  });
}


//Tag manipulation
function testCallingHelper(env){
  var tag;

  beforeEach(function(){
    tag = env.tag;
  });

  it("can call helper function", function(done){
    tag.call(doOnce(done));
  });
}
function testCreatesTags(env){
  var tag;

  beforeEach(function(){
    tag = env.tag;
  });

  it("creates tags", function(done){
    var expected = $('<p></p>');
    var doneOnce = doOnce(done);

    tag
      .p().close()
    .close();

    tag
      .call(function(el){
        var tags = $(el).children();
        expect(tags[0]).toMatchTag(expected[0]);
        doneOnce();
      });
  });
}
function testCreatesMultipleTags(env){
  var tag;

  beforeEach(function(){
    tag = env.tag;
  });

  it("creates tags", function(done){
    var expected = $('<p></p><span></span><ul></ul>');
    var doneOnce = doOnce(done);

    tag
      .p().close()
      .span().close()
      .ul().close()
    .close();

    tag
      .call(function(el){
        var tags = $(el).children();
        tags.each(function(i, el){
          expect(el).toMatchTag(expected[i]);
        });
        expect(tags.length).toBe(3);

        doneOnce();
      });
  });
}
function testChangingTag(env, has_data){
  var tag;

  beforeEach(function(){
    tag = env.tag;
  });

  it("can set the text using a string", function(){
    var expected = $('<div>hello world</div>')[0];

    tag
      .text("hello world")
    .close();

    tag.call(function(el){
      expect(el).toMatchTag(expected);
    });
  });

  it("can set attributes using a string", function(){
    var expected = $('<div id="string"></div>')[0];

    tag
      .attr("id", "string")
    .close();

    tag
      .call(function(el){
        expect(el).toMatchTag(expected);
      });
  });

  it("can set the text using a function", function(){
    var expected = $('<div>hello world</div>')[0];

    tag
      .text("hello world")
    .close();

    tag.call(function(el){
      expect(el).toMatchTag(expected);
    });
  });

  it("can set attributes using a function", function(){
    var expected = $('<div id="string"></div>')[0];

    tag
      .attr("id", "string")
    .close();

    tag
      .call(function(el){
        expect(el).toMatchTag(expected);
      });
  });

  if(has_data){
    it("can set the text using the current data and index", function(){
      var expected = $('<div>hello world</div>')[0];

      tag
        .text("hello world")
      .close();

      tag.call(function(el){
        expect(el).toMatchTag(expected);
      });
    });

    it("can set attributes using the current data and index", function(){
      var expected = $('<div id="string"></div>')[0];

      tag
        .attr("id", "string")
      .close();

      tag
        .call(function(el){
          expect(el).toMatchTag(expected);
        });
    });
  }
}


//Control flow
function testElement(env, depth, has_data){
  describe("within an element", function(){
    var tag,
        sub_env = {};

    beforeEach(function(){
      tag = env.tag.div();
      sub_env.parent = env.tag;
      sub_env.tag    = tag;
    });

    testInterface(sub_env);
    testCreatesTags(sub_env);
    testCreatesMultipleTags(sub_env);
    testChangingTag(sub_env, has_data);
    testCallingHelper(sub_env);

    if(depth-1){
      testElement(sub_env, depth-1);
      testIfBranch(sub_env, depth-1);
      testEachLoop(sub_env, depth-1);
    }
  });
}
function testIfBranch(env, depth){
  describe("within an if branch", function(){
    var $if;

    beforeEach(function(){
      $if = env.tag.$if(true);
    });

    it("has an else branch", function(){
      expect($if.$else).toBeDefined();
    });

    describe("when condition is true", function(){
      var sub_env = {};

      beforeEach(function(){
        sub_env.parent = env.tag;
        sub_env.tag    = env.tag.$if(true);
      });

      testTrueCase(sub_env);
    });
    describe("when condition is false", function(){
      var sub_env = {};

      beforeEach(function(){
        sub_env.parent = env.tag;
        sub_env.tag    = env.tag.$if(false);
      });

      testFalseCase(sub_env);
    });
  });

  describe("within an else branch", function(){
    describe("when condition is true", function(){
      var $if,
          sub_env = {};

      beforeEach(function(){
        sub_env.parent = env.tag;
        sub_env.tag    = env.tag.$if(true).$else();
      });

      testFalseCase(sub_env);
    });
    describe("when condition is false", function(){
      var $if,
          sub_env = {};

      beforeEach(function(){
        sub_env.parent = env.tag;
        sub_env.tag    = env.tag.$if(false).$else();
      });

      testTrueCase(sub_env);
    });
  });

  function testTrueCase(sub_env){
    testInterface(sub_env);
    testCreatesTags(sub_env);
    testCallingHelper(sub_env);

    if(depth-1){
      testElement(sub_env, depth-1);
      testIfBranch(sub_env, depth-1);
      testEachLoop(sub_env, depth-1);
    }
  }
  function testFalseCase(sub_env){
    var tag, parent;

    beforeEach(function(){
      parent = sub_env.parent || sub_env.tag;
      tag    = sub_env.tag;
    });

    testInterface(sub_env);

    it("doesn't create tags", function(done){
      var before, after;
      var doneOnce = doOnce(done);

      parent.call(function(el){
        before = $(el).clone();
      });
      
      tag
        .div().close()
      .close();
      
      parent.call(function(el){
        after = $(el).clone();
        expect(before[0]).toMatchTag(after[0]);
        doneOnce();
      });

    });

    it("doesn't call helper functions", function(){
      var spy = jasmine.createSpy("callSpy");
      tag.call(spy);
      expect(spy).not.toHaveBeenCalled();
    });
  }
}
function testEachLoop(env, depth){
  var loop, sub_env = {};

  describe("within an each loop", function(){
    beforeEach(function(){
      loop = env.tag.each(["item1", "item2", "item3"]);
      sub_env.parent = env.tag;
      sub_env.tag    = loop;
    });

    testInterface(sub_env);
    testCallingHelper(sub_env);

    it("creates multiple tags in parallel", function(done){
      var expected = $('<div>')[0];
      var times    = 3;
      function progress(){
        times--;
        if(!times){
          done();
        }
      }

      loop
        .div()
          .call(function(el){
            expect(el).toMatchTag(expected);
            progress();
          })
        .close()
      .close();
    });

    if(depth-1){
      testElement(sub_env, depth-1, true);
      testIfBranch(sub_env, depth-1);
    }
  });
}


//Utility
function doOnce(done){
  var isDone = false;
  return function(){
    if(!isDone){
      isDone = true;
      done();
    }
  };
}
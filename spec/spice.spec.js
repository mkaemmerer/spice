beforeEach(function(){
	this.addMatchers(TagMatchers)
})

describe("Spice", function(){
	describe("at top level", function(){
		var env = {}

		beforeEach(function(){
			env.parent = null
			env.tag    = $spice()
		})

		testInterface(env)
		testCreatesTags(env)
		testElement(env, 2)
		testIfBranch(env, 2)
		testEachLoop(env, 2)
	})

	describe("from an existing element", function(){
		var env = {}
		  , el

		beforeEach(function(){
			el         = $('<div id="root">')[0]
			env.parent = null
			env.tag    = $spice(el)
		})

		testInterface(env)
		testCreatesTags(env)
		testElement(env, 2)
		testIfBranch(env, 2)
		testEachLoop(env, 2)
	})

	describe("full example cases", function(){
		it("simulate jasmine output", function(){
			var expected = $('<div class="suite passed"><a class="description" href="?spec=Spice">Spice</a><div class="suite passed"><a class="description" href="?spec=Spice%20full%20example%20cases">full example cases</a><div class="specSummary passed"><a class="description" href="?spec=Spice%20full%20example%20cases%20simulate%20jasmine%20output." title="Spice full example cases simulate jasmine output.">simulate jasmine output</a></div></div></div>')

			var tags = 
				$spice()
					.div()
						.attr("class", "suite passed")
						.a().attr("href", "?spec=Spice")
							.text("Spice")
						.close()
						.div()
							.attr("class", "suite passed")
							.a().attr("href", "?spec=Spice%20full%20example%20cases")
								.text("full example cases")
							.close()
							.div()
								.attr("class", "specSummary passed")
								.a().attr("href", "?spec=Spice%20full%20example%20cases%20simulate%20jasmine%20output.")
									.text("simulate jasmine output")
								.close()
							.close()
						.close()
					.close()
				.close()

			expect(tags[0]).toMatchTag(expected[0])
		})
		
		it("list builder", function(){
			var expected = $('<ul>' +
				'<li>item0</li>' +
				'<li>item1</li>' +
				'<li>item2</li>' +
				'<li>item3</li>' +
				'<li>item4</li>' +
				'<li>item5</li>' +
				'</ul>')

			var tags = 
				$spice()
					.ul()
						.each(["item", "item", "item", "item", "item", "item"])
							.li()
								.text(function(d,i){ return d + i })
							.close()
						.close()
					.close()
				.close()

			expect(tags[0]).toMatchTag(expected[0])
		})

		it("trucated collection", function(){
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
				'</ul>')

			var tags = 
				$spice()
					.ul()
						.each(["item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item", "item"])
							._if(function(d,i){ return i < 10 })
								.li()
									.text(function(d,i){ return d + i })
								.close()
							.close()
						.close()
					.close()
				.close()

			expect(tags[0]).toMatchTag(expected[0])
		})
	})
})


function testInterface(env){
	var tag
	  , parent

	beforeEach(function(){
		tag = env.tag
		parent = env.parent
	})

	it("can create loops", function(){
		expect(tag.each).toBeDefined()
	})

	it("can create conditional branches", function(){
		expect(tag._if).toBeDefined()
	})

	it("can call helper functions", function(){
		expect(tag.call).toBeDefined()
	})

	it("returns the parent context when closed", function(){
		if(parent){
			expect(tag.close()).toBe(parent)
		}
	})
}


function testCallingHelper(env){
	var tag

	beforeEach(function(){
		tag = env.tag
	})

	it("can call helper function", function(){
		var spy = jasmine.createSpy("helper")
		
		tag.call(spy)

		expect(spy).toHaveBeenCalled()
	})
}
function testCreatesTags(env){
	var tag

	beforeEach(function(){
		tag = env.tag
	})

	it("creates tags", function(){
		var expected = $('<p></p><span></span><ul></ul>')
		  , spy      = jasmine.createSpy("callSpy")

		tag
			.p().close()
			.span().close()
			.ul().close()
		.close()

		tag
			.call(function(){
				var tags = $.isArray(this) ? $(this) : $(this).children()
				
				spy.call()
				tags.forEach(function(el, i){
					expect(el).toMatchTag(expected[i])
				})
				expect(tags.length).toBe(3)
			})

		expect(spy).toHaveBeenCalled()
	})
}
function testChangingTag(env, has_data){
	var tag

	beforeEach(function(){
		tag = env.tag
	})

	it("can set the text using a string", function(){
		var expected = $('<div>hello world</div>')[0]

		tag
			.text("hello world")
		.close()

		tag.call(function(){ expect(this).toMatchTag(expected) })
	})

	it("can set attributes using a string", function(){
		var expected = $('<div id="string"></div>')[0]

		tag
			.attr("id", "string")
		.close()

		tag
			.call(function(){ expect(this).toMatchTag(expected) })
	})

	it("can set the text using a function", function(){
		var expected = $('<div>hello world</div>')[0]

		tag
			.text("hello world")
		.close()

		tag.call(function(){ expect(this).toMatchTag(expected) })
	})

	it("can set attributes using a function", function(){
		var expected = $('<div id="string"></div>')[0]

		tag
			.attr("id", "string")
		.close()

		tag
			.call(function(){ expect(this).toMatchTag(expected) })
	})

	if(has_data){
		it("can set the text using the current data and index", function(){
			var expected = $('<div>hello world</div>')[0]

			tag
				.text("hello world")
			.close()

			tag.call(function(){ expect(this).toMatchTag(expected) })
		})

		it("can set attributes using the current data and index", function(){
			var expected = $('<div id="string"></div>')[0]

			tag
				.attr("id", "string")
			.close()

			tag
				.call(function(){ expect(this).toMatchTag(expected) })
		})
	}
}


function testElement(env, depth, has_data){
	describe("within an element", function(){
		var tag
		  , sub_env = {}

		beforeEach(function(){
			tag = env.tag.div()
			sub_env.parent = env.tag
			sub_env.tag    = tag
		})

		testInterface(sub_env)
		testCreatesTags(sub_env)
		testChangingTag(sub_env, has_data)
		testCallingHelper(sub_env)
		
		if(depth-1){
			testElement(sub_env, depth-1)
			testIfBranch(sub_env, depth-1)
			testEachLoop(sub_env, depth-1)
		}
	})
}
function testIfBranch(env, depth){
	describe("within an if branch", function(){
		var _if

		beforeEach(function(){
			_if = env.tag._if(true)
		})

		it("has an else branch", function(){
			expect(_if._else).toBeDefined()
		})

		describe("when condition is true", function(){
			var sub_env = {}

			beforeEach(function(){
				sub_env.parent = env.tag
				sub_env.tag    = env.tag._if(true)
			})

			testTrueCase(sub_env)
		})
		describe("when condition is false", function(){
			var sub_env = {}

			beforeEach(function(){
				sub_env.parent = env.tag
				sub_env.tag    = env.tag._if(false)
			})

			testFalseCase(sub_env)
		})
	})

	describe("within an else branch", function(){
		describe("when condition is true", function(){
			var _if
		  , sub_env = {}

			beforeEach(function(){
				sub_env.parent = env.tag
				sub_env.tag    = env.tag._if(true)._else()
			})

			testFalseCase(sub_env)
		})
		describe("when condition is false", function(){
			var _if
		  , sub_env = {}

			beforeEach(function(){
				sub_env.parent = env.tag
				sub_env.tag    = env.tag._if(false)._else()
			})

			testTrueCase(sub_env)
		})
	})

	function testTrueCase(sub_env){
		testInterface(sub_env)
		testCreatesTags(sub_env)
		testCallingHelper(sub_env)

		if(depth-1){
			testElement(sub_env, depth-1)
			testIfBranch(sub_env, depth-1)
			testEachLoop(sub_env, depth-1)
		}
	}
	function testFalseCase(sub_env){
		var tag
		  , parent

		beforeEach(function(){
			parent = sub_env.parent || sub_env.tag
			tag    = sub_env.tag
		})

		testInterface(sub_env)

		it("doesn't create tags", function(){
			var before
			  , after

			parent.call(function(){ before = $.isArray(this) ? this.slice(0) : $(this).clone() })
			tag
				.div().close()
			.close()
			parent.call(function(){ after = $.isArray(this) ? this.slice(0) : $(this).clone() })

			if($.isArray(before))
				expect(before).toEqual(after)
			else
				expect(before[0]).toMatchTag(after[0])
		})

		it("doesn't call helper functions", function(){
			var spy = jasmine.createSpy("callSpy")
			tag.call(spy)
			expect(spy).not.toHaveBeenCalled()
		})
	}
}
function testEachLoop(env, depth){
	var loop
	  , sub_env = {}

	describe("within an each loop", function(){
		beforeEach(function(){
			loop = env.tag.each(["item1", "item2", "item3"])
			sub_env.parent = env.tag
			sub_env.tag    = loop
		})

		testInterface(sub_env)
		testCallingHelper(sub_env)

		it("creates multiple tags in parallel", function(){
			var expected = $('<div>')[0]
			
			loop
				.div().close()
				.call(function(){
					var tags = $.isArray(this) ? $(this) : $(this).children()

					tags.forEach(function(tag){
						expect(tag).toMatchTag(expected)
					})
					expect(tags.length).toBe(3)
				})
			.close()
		})

		if(depth-1){
			testElement(sub_env, depth-1, true)
		}
	})
}
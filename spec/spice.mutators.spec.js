beforeEach(function(){
	this.addMatchers(TagMatchers)
})

describe("Spice", function(){
	describe("mutators", function(){
		it("can set the id", function(){
			var tag =
					$spice()
						.div().id("my-id")
						.close()
					.close()
			  , expected = $('<div id="my-id">');

			expect(tag[0]).toMatchTag(expected[0]);
		})

		it("can set the class", function(){
			var tag =
					$spice()
						.div()._class("my-class")
						.close()
					.close()
			  , expected = $('<div class="my-class">');

			expect(tag[0]).toMatchTag(expected[0]);
		})

		it("can set the class using a hash", function(){
				var tag =
					$spice()
						.div().classed({
							"accordion": true
						, "animate-in": true
						, "closed": false
						})
						.close()
					.close()
			  , expected = $('<div class="accordion animate-in">');

			expect(tag[0]).toMatchTag(expected[0]);
		})

		it("can set the href", function(){
			var tag =
					$spice()
						.a().href("#")
						.close()
					.close()
			  , expected = $('<a href="#">');

			expect(tag[0]).toMatchTag(expected[0]);
		})

		it("can set the name", function(){
			var tag =
					$spice()
						.input().name("my-value")
						.close()
					.close()
			  , expected = $('<input name="my-value">');

			expect(tag[0]).toMatchTag(expected[0]);
		})

		it("can set the placeholder text", function(){
			var tag =
					$spice()
						.input().placeholder("search for products")
						.close()
					.close()
			  , expected = $('<input placeholder="search for products">');

			expect(tag[0]).toMatchTag(expected[0]);
		})

		it("can set the image source", function(){
			var tag =
					$spice()
						.img().src("/thumbnail-image.png")
						.close()
					.close()
			  , expected = $('<img src="/thumbnail-image.png">');

			expect(tag[0]).toMatchTag(expected[0]);
		})

		it("can set the title", function(){
			var tag =
					$spice()
						.a().title("click here to browse our catalog")
						.close()
					.close()
			  , expected = $('<a title="click here to browse our catalog">');

			expect(tag[0]).toMatchTag(expected[0]);
		})

		it("can set the input type", function(){
			var tag =
					$spice()
						.input().type("password")
						.close()
					.close()
			  , expected = $('<input type="password">');

			expect(tag[0]).toMatchTag(expected[0]);
		})

		it("can set the value", function(){
			var tag =
					$spice()
						.input().value("some-value")
						.close()
					.close()
			  , expected = $('<input value="some-value">');

			expect(tag[0]).toMatchTag(expected[0]);
		})
	})
})
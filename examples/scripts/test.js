$spice.fn.myclass = function(stream, data, index){
	var div =
		stream
			.li().attr("class", "my-class")
				.div()

	return div.bindClose(stream)
}

var first_name = "Matt"
  , last_naem  = "Kaemmerer"

$spice.select('#main')
	.h1().text("Heading").close()
	.h2().text("Subtitle").close()
	.h3().text("Subheading").close()
	.div()
		.ul().attrs({id: "list"})
			.each(["thing1", "thing2"])
				.myclass().text(function(d){ return d })
					.ul()
						.each(["subthing1", "subthing2", "subthing3"])
							.li().text(function(d){ return d })
								._if(function(d,i){ return i == 0 })
									.div()
										.text("0")
										.text(first_name)
										.text(" - ")
										.text(last_naem)
									.close()
								.close()
								._if(function(d,i){ return i == 1 })
									.div().text("1")
									.close()
								.close()
							.close()
						.close()
					.close()
				.close()
			.close()
		.close()
	.close()
	.h1().text("Heading 2").close()
	.p().text("Lorem ipsum dolor sit amet").close()
.close()

$spice.select('#main')
	._if(false)
		.p().text("true branch").close()
	._else()
		.p().text("false branch").close()
	.close()
.close()
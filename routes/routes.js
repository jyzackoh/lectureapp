// app/routes.js
var User = require('../models/users');
var Annotation = require('../models/annotations');
var Slides = require('../models/slides');

module.exports = function(app, passport) {

	app.get('/', isLoggedIn, function(req, res) {
		var redirect_to_link = req.session.redirect_to_link ? req.session.redirect_to_link : null;
		delete req.session.redirect_to_link;
		var redirect_to_id = req.session.redirect_to_id ? req.session.redirect_to_id : null;
		delete req.session.redirect_to_id;

		if (redirect_to_link == null || redirect_to_id == null) {
			res.render('index'); // load the index.ejs file
		} else {
			res.redirect("/" + redirect_to_link + "/" + redirect_to_id);			
		}
	});


	app.get('/go', function(req,res) {
		res.redirect("/analysis/" + req.query.pdf_id);
	});

	app.get('/download', function(req,res) {
		res.download("./uploads/"+req.query.path+".pdf");
	});

	app.get('/login', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('login', { message: req.flash('loginMessage') }); 
		// res.render('login'); 
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.get('/signup', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('signup', { message: req.flash('signupMessage') });
		// res.render('signup');
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/account', isLoggedIn, function(req, res) {
		Slides.find({ 'user' : req.user.id }).exec(function(err, slides) {
			res.render('account', { owned_slides: slides, user: req.user.local.email});
		});
	});

	app.get('/annotate', isLoggedIn, function(req, res) {
		var pdf_id = req.query.pdf_id;
		var slide_page = req.query.slide_page;
		var x_val = req.query.x_val;
		var y_val = req.query.y_val;
		Annotation.findOne({'slides': req.query.pdf_id}).where({'user': req.user.id}).where({'page': slide_page}).where({'x': x_val}).where({'y': y_val}).exec(function(err, annotation) {
			if (err) {
				res.json({result: 'Annotation unsuccessful, please try again!'});
			}
			if (annotation) {
				//annotation already exists, toggle visibility
				console.log(annotation);
				if (annotation.visibility == 0) {
					annotation.visibility = 1;
					annotation.save();
					res.json({ result: '1' });
				} else {
					annotation.visibility = 0;
					annotation.save();
					res.json({ result: '0' });
				}
			} else {
				//add new one
				var newAnnotation = new Annotation();

				// set the user's local credentials
				newAnnotation.page = slide_page;
				newAnnotation.visibility = 1;
				newAnnotation.x = x_val;
				newAnnotation.y = y_val;
				newAnnotation.slides = pdf_id;
				newAnnotation.user = req.user;

				console.log(newAnnotation.visibility);

				newAnnotation.save(function(err) {
					if (err)
						throw err;
					//send json OK with new annotation info
					res.json({ result: '1' });
				});
			}
		});
	});

	app.get('/get/annotate', isLoggedIn, function(req, res) {
	// app.get('/get/annotate', function(req, res) {
		
		var pdf_id = req.query.pdf_id;

		if (pdf_id == undefined) {
			res.json({ result: 'undefined pdf_id' });
		} else {
			Slides.findOne({ 'id' :	pdf_id }, function(err, slides) {
				if (slides) {
					if (slides.user == req.user.id) {
						Annotation.find({'slides': req.query.pdf_id}).where({'visibility': 1}).exec(function(err, annotation) {
							if (err) {
								res.json({result: 'Annotation unsuccessful, please try again!'});
							}
							if (annotation) {
								//annotation already exists, toggle visibility
								console.log(annotation);
								res.json({ result: annotation });
							} else {
								res.json({ result: '[]' });
							}
						});
					} else {
						Annotation.find({'slides': req.query.pdf_id}).where({'user': req.user.id}).where({'visibility': 1}).exec(function(err, annotation) {
							if (err) {
								res.json({result: 'Annotation unsuccessful, please try again!'});
							}
							if (annotation) {
								//annotation already exists, toggle visibility
								res.json({ result: annotation });
							} else {
								res.json({ result: '[]' });
							}
						});
					}
				} else {
					res.json({ result: 'no such slide' });
				}
			});
		}
	});


	app.get('/clear/annotate', isLoggedIn, function(req, res) {
	// app.get('/get/annotate', function(req, res) {
		
		var pdf_id = req.query.pdf_id;
		var page = req.query.page;

		if (pdf_id == undefined || page == undefined) {
			res.json({ result: 'undefined pdf_id' });
		} else {
			Slides.findOne({ 'id' :	pdf_id }, function(err, slides) {
				if (slides) {
					Annotation.find({'slides': req.query.pdf_id}).where({'user': req.user.id}).where({'visibility': 1}).where({'page': page}).exec(function(err, annotation) {
						if (err) {
							res.json({result: 'some error happened clearing annotation'});
						}
						if (annotation) {
							//annotation already exists, toggle visibility
							console.log(annotation);
							for (var i = 0; i < annotation.length; i++) {
								annotation[i].visibility = 0;
								annotation[i].save();
							}
							res.json({ result: '[]' });
						} else {
							res.json({ result: '[]' });
						}
					});
				} else {
					res.json({ result: 'no such slide' });
				}
			});
		}
	});



	app.post('/upload', function(req, res) {
		var path = req.files.slides.name.slice(0, -4);
		//add to DB
		var addToDatabase = function(uniqueId) {
			Slides.findOne({ 'id': path }, function(err, slides) {
				// if there are any errors, return the error
				if (err) {
					res.render('index', { message: 'error with upload, please try again!' }); 
				} else if (slides) {
					res.redirect("/view/" + slides.id);
				} else {
					var newSlides = new Slides();

					// set the user's local credentials
					newSlides.id = uniqueId;
					newSlides.name = req.files.slides.originalname;
					newSlides.path = path;
					newSlides.user = req.user;

					// save the user
					newSlides.save(function(err) {
						if (err)
							throw err;
						console.log("HIHIHIHIHI SUCCESSSS!")
						res.redirect("/analysis/" + newSlides.id);
					});
				}
				return null;
			});	
		}
		getUniqueId(addToDatabase);

	});

	app.get('/:link(view)/:id([0-9a-zA-Z]{6})$/', isLoggedIn, function(req, res) {
		//find slides with the input id. If have, render, else redirect to upload page
		var pdf_id = req.params.id;
		Slides.findOne({ 'id' :	pdf_id }, function(err, slides) {
			if (slides) {
				res.render('slides', { slides: slides, user: req.user, notok: 10, isok:12});
			} else {
				res.render('index', { message: (pdf_id + ' was not found, please try again!') }); 
			}
		});
	});

	app.get('/:link(analysis)/:id([0-9a-zA-Z]{6})$/', isLoggedIn, function(req, res) {
		//find slides with the input id. If have, render, else redirect to upload page
		var pdf_id = req.params.id;
		Slides.findOne({ 'id' :	pdf_id }, function(err, slides) {
			if (slides) {
				if (slides.user == req.user.id) {
					// Annotation.find({'slides': pdf_id}).exec(function(err, annotation) {
					// 	console.log(annotation);
					// 	res.render('analysis', { id: pdf_id, user: req.user.local.email, path: slides.path, annotations: annotation });
					// });
					Annotation.aggregate(
						[
							// Matching pipeline
							{ "$match": { "slides": pdf_id, "visibility":1 }}, 
							// Grouping pipeline
							{ "$group": { 
									"_id": '$page', //aggregate by what?
									"confusionCount": { "$sum": "$visibility" },
							}},
							// Sorting pipeline
							{ "$sort": { "confusionCount": -1 } }
						],
						function(err,annotation) {
							 // Result is an array of documents
							console.log(annotation);
							res.render('analysis', { id: pdf_id, user: req.user.local.email, path: slides.path, annotations: annotation });
						}
					);
				} else {
					res.redirect("/view/" + pdf_id);
				}
			} else {
				res.render('index', { message: (pdf_id + ' was not found, please try again!') }); 
			}
		});
	});
};


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't, save their current page and redirect them to the home page
	req.session.redirect_to_link = req.params.link;
	req.session.redirect_to_id = req.params.id;
	res.redirect('/login');
}

// route middleware to make sure a user is logged in
function getUniqueId(addToDatabase) {
	var text = genRandomId();
	Slides.findOne({'id': text}, function(err, slides) {
		if (slides) {
			getUniqueId();
		} else {
			addToDatabase(text);
		}
	});
}

function genRandomId() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < 6; i++ )
			text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}
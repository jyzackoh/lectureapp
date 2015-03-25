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
		res.download("./uploads/"+req.query.pdf_id+".pdf");
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

	app.post('/upload', function(req, res) {
		var pdf_id = req.files.slides.name.slice(0, -4);

		//add to DB
		Slides.findOne({ 'id': pdf_id }, function(err, slides) {
			// if there are any errors, return the error
			if (err) {
				res.render('index', { message: 'error with upload, please try again!' }); 
			} else if (slides) {
				res.redirect("/view/" + pdf_id);
			} else {
				var newSlides = new Slides();

				// set the user's local credentials
				newSlides.id = pdf_id;
				newSlides.user = req.user;

				console.log(req.user);
				console.log(newSlides.user);

				// save the user
				newSlides.save(function(err) {
					if (err)
						throw err;
					console.log("HIHIHIHIHI SUCCESSSS!")
					res.redirect("/analysis/" + pdf_id);
				});
			}
			return null;
		});	
	});

	app.get('/:link(view)/:id([0-9a-zA-Z]{32})$/', isLoggedIn, function(req, res) {
		//find slides with the input id. If have, render, else redirect to upload page
		var pdf_id = req.params.id;
		Slides.findOne({ 'id' :  pdf_id }, function(err, slides) {
			if (slides) {
				res.render('slides', { slidespath: pdf_id, user: req.user.local.email });
			} else {
				res.render('index', { message: (pdf_id + ' was not found, please try again!') }); 
			}
		});
	});

	app.get('/:link(analysis)/:id([0-9a-zA-Z]{32})$/', isLoggedIn, function(req, res) {
		//find slides with the input id. If have, render, else redirect to upload page
		var pdf_id = req.params.id;
		Slides.findOne({ 'id' :  pdf_id }, function(err, slides) {
			if (slides) {
				if (slides.user == req.user.id) {
					res.render('analysis', { slidespath: pdf_id, user: req.user.local.email });
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
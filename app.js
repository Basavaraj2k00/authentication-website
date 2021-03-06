require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')
const FacebookStrategy = require("passport-facebook")
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    facebookId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });





//   window.fbAsyncInit = function() {
//     FB.init({
//       appId      : '{your-app-id}',
//       cookie     : true,
//       xfbml      : true,
//       version    : '{api-version}'
//     });
      
//     FB.AppEvents.logPageView();   
      
//   };

//   (function(d, s, id){
//      var js, fjs = d.getElementsByTagName(s)[0];
//      if (d.getElementById(id)) {return;}
//      js = d.createElement(s); js.id = id;
//      js.src = "https://connect.facebook.net/en_US/sdk.js";
//      fjs.parentNode.insertBefore(js, fjs);
//    }(document, 'script', 'facebook-jssdk'));












passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
      
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



passport.use(new FacebookStrategy({
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));




app.get("/", function (req, res) {
    res.render("home");
});


app.get("/auth/google",
  passport.authenticate('google', { scope: ['profile'] }));

  app.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect("/secrets");
  });

  app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  });

app.get("/login", function (req, res) {
    res.render("login");
});

app.post("/login", function (req, res) { 

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

req.login(user, function(err){
    
    if(err)
    {
        console.log(err);
        
    }
    else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
        })
    }
})

});

app.get("/secrets", function (req, res) {


    if(req.isAuthenticated())
    {
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
   
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
})



app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {

    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function () {
                res.render("secrets");
            })

        }
    });
});











// app.get("/",function(req,res){

// });














app.listen(process.env.PORT || 3000, function () {
    console.log("Server has started successfully");
});

////////////////////code for later use///////////////////////\

// const username = req.body.username;
//     const password = req.body.password;

//     User.findOne({ email: username }, function (err, foundUser) {
//         if (err) {
//             console.log(err);

//         } else {
//             if (foundUser) {

//                 bcrypt.compare(password, foundUser.password, function (err, result) {
//                     if (result === true) {
//                         res.render("secrets");
//                     }

//                 });

//             }

//         }

//     });

// bcrypt.genSalt(saltRounds, function (err, salt) {
//     bcrypt.hash(req.body.password, salt, function (err, hash) {
//         // Store hash in your password DB.

//         const newUser = new User({
//             email: req.body.username,
//             password: hash
//         })

//         newUser.save(function (err) {
//             if (err) {
//                 console.log(err);

//             } else {
//                 res.render("secrets");
//             }
//         });
//     });
// });

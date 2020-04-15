require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
    session({
        secret: "our lil secret.",
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
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
    res.render("home");
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
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}
// import * as path from 'path';

const express = require("express");
// const serverless = require("serverless-http");
const app = express();
const bodyparser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt") 
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
var path = require('path')
// const url = require('node:url');

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )



const users = []

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, 
    saveUninitialized: false
}))
app.use(passport.initialize()) 
app.use(passport.session())
app.use(methodOverride("_method"))
app.use(express.static("public"))
app.use(bodyparser.urlencoded({extended: true}));



// app.use(express.static("JS"))
// app.use(express.static(path.join(__dirname,'CSS')))
// Configuring the register post functionality
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

// Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(), 
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        console.log(users); // Display newly registered in the console
        res.redirect("/login")
        
    } catch (e) {
        console.log(e);
        res.redirect("/register")
    }
})
app.post("/",function(req,res){
    var comm = req.body.text;
    var na = req.body.name;
    var ph = req.body.phone;
    var em = req.body.email;
    var transpoter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'teenujoshi0304@gmail.com',
            pass: 'linm vuae pmlw sfoo'
        }
    })
    // body: 'name: ' +na + '<br/> email: ' + em + '<br/> phone' + ph + '<br/> text' + comm;

   

    var mailOptions = {
        from: req.body.username,
        to: 'teenujoshi0304@gmail.com',
        cc: 'teenujoshi0304@gmail.com',
        subject: 'Thanks for giving feedback---- ' + na,
        // name: 'Name--> '+ na,
        text: 'Thanks for your message you have sent to us--> '+ comm
        // body: 'name: ' +na + '<br/> email: ' + em + '<br/> phone' + ph + '<br/> text' + comm
        // text: emailContent
    };

    transpoter.sendMail(mailOptions,function(error,info){
        if(error){
            console.log(error);
        }else{
            res.redirect('/');
            console.log("email sent" + info.response);
        }
    })
});
// Routes
app.get('/', checkAuthenticated, (req, res) => {
    res.render("index.ejs", {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})

app.get("/",function(req,res){
    res.sendFile(__dirname + "/index.ejs");
    console.log(__dirname);
})
// End Routes

// app.delete('/logout', (req, res) => {
//     req.logOut()
//     res.redirect('/login')
//   })

app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

// app.delete("/logout", checkAuthenticated, (req, res) => {
//     req.logout();
//     res.redirect("/login");
// });

// app.delete("/logout", checkAuthenticated, (req, res) => {
//     console.log("Logout route hit");
//     req.logout();
//     res.redirect("/login");
// });

// app.post("/contact", (req, res) => {
//     console.log("Contact form submitted");
//     // Handle form submission logic
// });

// app.delete("/logout", checkAuthenticated, (req, res) => {
//     console.log("Logout route hit");
//     req.logout();
//     res.redirect("/login");
// });

// app.post("/", (req, res) => {
//     console.log("Contact form submitted");
//     // Handle form submission logic
// });

// app.delete("/logout", checkAuthenticated, (req, res) => {
//     console.log("Logout route hit");
//     console.log("User:", req.user); // Log user information
//     req.logout();
//     console.log("User after logout:", req.user); // Log user information after logout
//     res.redirect("/login");
// });




function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}


// app.use('/.netlify/functions/api',router);
// module.exports.handler=serverless(app);

app.listen(3000)
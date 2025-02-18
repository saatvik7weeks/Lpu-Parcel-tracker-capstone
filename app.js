const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const userModel = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

const JWT_SECRET = "your_secret_key";  // Consistent secret key

app.get('/', (req, res) => {
    res.render('signup.ejs');
});

app.post('/create', (req, res) => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, async (err, hash) => {
            let createuser = await userModel.create({
                username: req.body.username,
                email: req.body.email,
                password: hash,
                age: req.body.age
            });

            let token = jwt.sign({ email: req.body.email }, JWT_SECRET);
            res.cookie("token", token);
            res.redirect('/login');
        });
    });
});

app.get('/homepage', isloggedin, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    res.render('homepage.ejs', { user: user });
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return res.send('User not found');
    }

    bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (result) {
            let token = jwt.sign({ email: req.body.email }, JWT_SECRET);
            res.cookie("token", token);
            res.redirect('/homepage');
        } else {
            res.send('Incorrect password');
        }
    });
});

app.get('/logout', (req, res) => {
    res.cookie("token", "");
    res.redirect('/');
});

function isloggedin(req, res, next) {
    if (req.cookies.token === "") {
        return res.redirect('/login');
    }
    try {
        let data = jwt.verify(req.cookies.token, JWT_SECRET);
        req.user = data;
        next();
    } catch (err) {
        res.redirect('/login');
    }
}

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

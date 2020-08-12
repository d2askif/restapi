const path = require('path');

const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const csurf = require('csurf');
const express = require('express');
const mongoose = require('mongoose');
const sessions = require('client-sessions');
const models = require('./models');
const authRoutes = require('./route/auth');
const auth = require('./auth');
const morgan = require('morgan');

const app = express();
mongoose.connect(
  'mongodb+srv://daniel:ict4rd2012@cluster0-j7d3x.mongodb.net/test?retryWrites=true&w=majority'
);
app.use(
  sessions({
    cookieName: 'session',
    secret: 'secret',
    duration: 60 * 60 * 60,
    activeDuration: 60 * 60 * 60,
    cookie: {
      httpOnly: true,
      ephemeral: false,
      secure: false,
    },
  })
);
app.use(morgan('combined'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(auth.loadUserFromSession);
app.use(authRoutes);
app.get('/', test, test2, function (req, res) {
  res.send('hello world');
});
app.post('/login', (req, res, next) => {
  console.log(req.body.email);

  models.User.findOne(
    { email: req.body.email },
    'firstName lastName email password',
    (err, user) => {
      if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
        return res.render('login', {
          error: 'Incorrect email / password.',
        });
      }
    }
  );

  auth.createUserSession(req, res, user);
  console.log('login');
  res.send('ok');
});

app.get('/test', (req, res) => {
  console.log(req.user);

  res.json(req.user);
});

function test(req, res, next) {
  console.log('test');
  //res.send('test');
  next();
}
function test2(req, res, next) {
  console.log('test2');
  //res.send('test2');
  next();
}

app.listen(3000, () => console.log('http://localhost:3000'));

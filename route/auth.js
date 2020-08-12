const models = require('../models');
const bcrypt = require('bcryptjs');
const express = require('express');
const auth = require('../auth');

let router = express.Router();
const nJwt = require('njwt');

router.post('/register', async (req, res) => {
  let hash = bcrypt.hashSync(req.body.password, 14);
  req.body.password = hash;
  let user = new models.User(req.body);

  try {
    const doc = await user.save();
    auth.createUserSession(req, res, user);
    res.send('ok');
  } catch (err) {
    if (err) {
      let error = 'Something bad happened! Please try agian.';

      if (err.code === 11000) {
        error = 'That email is already taken. Please try another.';
      }
      console.log(err);

      /* return res.render('register', {
        error: error,
        csrfToken: req.csrfToken(),
      }); */
      return res.send('ok');
    }

    //res.redirect('/dashboard');
  }
});
module.exports = router;

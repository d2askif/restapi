const nJwt = require('njwt');
const models = require('./models');

const loginRequired = (req, res, next) => {
  if (req.user) {
    console.log('user logedin');

    return next();
  }

  res.json('need to login');
};

module.exports.createUserSession = (req, res, user) => {
  let claims = {
    // you can embed a comma-delimited list of scopes here that will be used for
    // authorization
    scope: 'active',
    sub: user._id,
  };
  let jwt = nJwt.create(claims, 'key', 'HS512');

  jwt.setExpiration(new Date().getTime() + 60 * 60 * 60);
  req.session.userToken = jwt.compact();
};

module.exports.loadUserFromSession = (req, res, next) => {
  console.log(req.session.userToken);

  if (!(req.session && req.session.userToken)) {
    return next();
  }

  nJwt.verify(req.session.userToken, 'key', 'HS512', (err, verifiedJwt) => {
    if (err) {
      return next();
    }
    console.log(verifiedJwt);

    models.User.findById(verifiedJwt.body.sub, (err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return next();
      }

      // Remove the password hash from the User object.  This way we don't
      // accidentally leak it.
      user.password = undefined;

      // Here is where we store the user object in the current request for
      // developer usage.  If the user wasn't found, these values will be set to a
      // non-truthy value, so it won't affect anything.
      req.user = user;
      res.locals.user = user;

      next();
    });
  });
};

module.exports = function (app, UserModel) {

  app.post('/assignment/api/user', createUser);
  app.get('/assignment/api/user', findUser);
  app.get('/assignment/api/user/:userId', findUserById);
  app.put('/assignment/api/user/:userId', updateUser);
  app.delete('/assignment/api/user/:userId', deleteUser);

  function createUser(req, res) {
    var user = req.body;
    if (user) {
      UserModel.createUser(user).then(function (user) {
        res.json(user);
      }, function (error) {
        if (error.code === 11000) {
          res.status(409).send('A user with that username already exists.');
        } else {
          res.status(500);
        }
      });
    } else {
      res.status(400).send('Invalid request body.');
    }
  }

  function findUser(req, res) {
    if (req.query.username && req.query.password) {
      findUserByCredentials(req, res);
    } else if (req.query.username) {
      findUserByUsername(req, res);
    } else {
      res.status(400).send('Missing query parameters.');
    }
  }

  function findUserById(req, res) {
    UserModel.findUserById(req.params.userId).then(function (user) {
      if (user) {
        res.json(user);
      } else {
        res.status(404).send('User with that ID does not exist.');
      }
    }, function () {
      res.sendStatus(500);
    })
  }

  function updateUser(req, res) {
    if (req.body) {
      UserModel.updateUser(req.params.userId, req.body).then(function () {
        res.sendStatus(200);
      }, function () {
        res.sendStatus(500);
      });
    } else {
      res.status(400).send('Invalid request body.');
    }
  }

  function deleteUser(req, res) {
    UserModel.deleteUser(req.params.userId).then(function () {
      res.sendStatus(200);
    }, function () {
      res.sendStatus(500);
    })
  }

  function findUserByCredentials(req, res) {
    UserModel.findUserByCredentials(req.query.username, req.query.password).then(function (user) {
      res.json(user);
    }, function () {
      res.sendStatus(500);
    });
  }

  function findUserByUsername(req, res) {
    UserModel.findUserByUsername(req.query.username).then(function (user) {
      res.json(user);
    }, function () {
      res.sendStatus(500);
    });
  }
};
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const ConflictingRequest = require('../errors/conflicting-request-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id).then((user) => {
    res.status(200).send(user);
  }).catch((err) => {
    next(err);
  });
};

module.exports.updateUserInfo = (req, res, next) => {
  const { name, email } = req.body;
  User.findOne({ email }).then((data) => {
    if (!data) {
      User.findByIdAndUpdate(req.user._id, { name, email }, {
        new: true,
        runValidators: true,
      }).then((user) => {
        if (user) {
          res.status(200).send(user);
        } else { throw new NotFoundError('Пользователь с указанным _id не найден'); }
      }).catch((err) => {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
          next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
        } else {
          next(err);
        }
      });
    } else {
      next(new ConflictingRequest('Email занят'));
    }
  }).catch((err) => {
    next(err);
  });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new UnauthorizedError('Не передан email или пароль');
  }
  User.findOne({ email }).select('+password').then((user) => {
    if (!user) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }
    return bcrypt.compare(password, user.password).then((data) => {
      if (!data) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      const token = jwt.sign({ _id: user._id }, NODE_ENV !== 'production' ? 'some-secret-key' : JWT_SECRET, { expiresIn: '7d' });
      return res.send({ token });
    });
  }).catch((err) => {
    next(err);
  });
};

module.exports.register = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  if (!name || !email || !password) {
    next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
  }
  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({
        name, email, password: hash,
      })
        .catch((err) => {
          if (err.code === 11000) {
            next(new ConflictingRequest('Пользователь с таким email уже зарегистрирован'));
          }
          next(err);
        })
        .then((user) => res.status(200).send({
          _id: user._id,
          name: user.name,
          email: user.email,
        }))
        .catch(
          (err) => {
            if (err.name === 'ValidationError') {
              next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
            }
            next(err);
          },
        );
    }).catch((err) => { next(err); });
};

const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const Forbidden = require('../errors/forbidden-err');

module.exports.getMovies = (req, res, next) => {
  Movie.find({}).then((data) => {
    if (data.length >= 1) {
      res.send(data);
    } else {
      res.status(200).send({ message: 'Фильмы не найдены' });
    }
  }).catch((err) => {
    next(err);
  });
};

module.exports.createMovie = (req, res, next) => {
  const {
    country, director, duration, year, description, image,
    trailerLink, nameRU, nameEN, thumbnail, movieId,
  } = req.body;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner: req.user._id,
  }).then((movie) => {
    res.send(movie);
  }).catch((err) => {
    if (err.name === 'ValidationError') {
      next(new BadRequestError('Переданы некорректные данные при создании фильма'));
    } else {
      next(err);
    }
  });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id).then((movie) => {
    if (movie) {
      if (req.user._id === movie.owner.toString()) {
        Movie.findByIdAndRemove(req.params._id).then((mov) => {
          res.send(mov);
        }).catch((err) => {
          if (err.name === 'CastError') {
            next(new BadRequestError('Переданы некорректные данные при удалении фильма'));
          } else {
            next(err);
          }
        });
      } else {
        throw new Forbidden('Вы не можете удалять чужие фильмы');
      }
    } else { throw new NotFoundError('Фильм с указанным _id не найден'); }
  });
};

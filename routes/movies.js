const router = require('express').Router();
const validator = require('validator');
const { celebrate, Joi } = require('celebrate');
const { getMovies, createMovie, deleteMovie } = require('../controllers/movies');

router.get('/', getMovies);
router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().custom((value, helpers) => {
      if (validator.isURL(value)) {
        return value;
      } return helpers.message('Заполните поле валидным URL');
    })
      .message({ 'string.required': 'Поле не должны быть пустым' }),
    trailerLink: Joi.string().required().custom((value, helpers) => {
      if (validator.isURL(value)) {
        return value;
      } return helpers.message('Заполните поле валидным URL');
    })
      .message({ 'string.required': 'Поле не должны быть пустым' }),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().required().custom((value, helpers) => {
      if (validator.isURL(value)) {
        return value;
      } return helpers.message('Заполните поле валидным URL');
    })
      .message({ 'string.required': 'Поле не должны быть пустым' }),
    //movieId: Joi.string().required().hex().length(24),
movieId: Joi.number().required()
  }),
}), createMovie);

router.delete('/:_id', celebrate({
  params: Joi.object().keys({
    _id: Joi.string().required().hex().length(24),
  }),
}), deleteMovie);

module.exports = router;

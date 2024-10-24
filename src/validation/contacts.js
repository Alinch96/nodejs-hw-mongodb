import Joi from 'joi';

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.base': 'Name should be a string',
    'string.min': 'Name should have at least {#limit} characters',
    'string.max': 'Name should have at most {#limit} characters',
    'any.required': 'Name is required',
  }),
  phoneNumber: Joi.string().required().messages({
    'string.base': 'PhoneNumber should be a string',
    'any.required': 'PhoneNumber is required',
  }),
  email: Joi.string().email().messages({
    'string.base': 'Email should be a string',
    'string.email':
      'Email should match to the "test@example.com" pattern where "example is a domain',
  }),
  isFavourite: Joi.boolean().messages({
    'boolean.base': 'IsFavourite should be a boolean',
  }),
  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .required()
    .messages({
      'string.base': 'ContactType should be a string',
      'string.valid': 'ContactType should be "work" or "home" or "personal"',
      'any.required': 'ContactType is required',
    }),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    'string.base': 'Name should be a string',
    'string.min': 'Name should have at least {#limit} characters',
    'string.max': 'Name should have at most {#limit} characters',
  }),
  phoneNumber: Joi.string().messages({
    'string.base': 'PhoneNumber should be a string',
  }),
  email: Joi.string().email().messages({
    'string.base': 'Email should be a string',
    'string.email':
      'Email should match to the "test@example.com" pattern where "example" is a domain',
  }),
  isFavourite: Joi.boolean().messages({
    'boolean.base': 'IsFavourite should be a boolean',
  }),
  contactType: Joi.string().valid('work', 'home', 'personal').messages({
    'string.base': 'ContactType should be a string',
    'string.valid': 'ContactType should be "work" or "home" or "personal"',
  }),
});

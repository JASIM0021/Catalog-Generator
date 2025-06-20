import Joi from 'joi';
import logger from '../utils/logger.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      logger.warn('Validation error:', errorDetails);

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails
      });
    }

    req.body = value;
    next();
  };
};
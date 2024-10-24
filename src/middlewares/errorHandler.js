import { isHttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  if (isHttpError(err)) {
    res.status(err.statusCode).json(
      err.errors
        ? {
            status: err.statusCode,
            message: err.message,
            data: {
              message: Array.isArray(err.errors)
                ? err.errors.map(({ message }) => message).join('---')
                : err.errors,
            },
          }
        : {
            status: err.statusCode,
            message: err.message,
          },
    );
    return;
  }
  res.status(500).json({
    status: 500,
    message: 'Something went wrong',
    data: err.message,
  });
};

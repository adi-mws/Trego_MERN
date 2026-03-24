// middleware/error.middleware.js

export const globalErrorHandler = (err, req, res, next) => {
    // Default error values
    let statusCode = err.statusCode || 500;
    let message =
        err.message || "Something went wrong. Please try again later.";

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
            .map(e => e.message)
            .join(", ");
    }

    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    }

    // Log error (detailed in dev, minimal in prod)
    if (process.env.NODE_ENV !== "production") {
        console.error("Global Error Handler:", err);
    }

    res.status(statusCode).json({
        success: false,
        message,
    });
};

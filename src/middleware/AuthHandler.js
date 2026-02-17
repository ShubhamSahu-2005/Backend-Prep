export const authHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        const error = new Error("Unauthorized");
        error.statusCode = 401;
        return next(error);
    }

    next();
};

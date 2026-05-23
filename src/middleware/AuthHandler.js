export const authHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        const error = new Error("No Token");
        error.statusCode = 401;
        return next(error);
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = decoded.id;


        next();
    } catch (error) {
        error(next);


    }

};

import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "88fcf1_access_token_secret_key_97531";

export const authHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        const error = new Error("No Token");
        error.statusCode = 401;
        return next(error);
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        req.userId = decoded.id;


        next();
    } catch (error) {
        next(error);


    }

};

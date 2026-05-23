import mongoose from "mongoose";
import { User } from "../../models/User.js";
import { RefreshToken } from "../../models/refreshToken.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";



export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Some of the Fields are Missing",
            })
        }
        const existing = await User.findOne({
            email
        });
        if (existing) {
            return res.status(400).json({
                message: "uSer already exists",
            })
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, password: hashed,
        });
        return res.status(201).json({
            message: "User Registered",
            user
        })

    } catch (error) {
        next(error)

    }
};


export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Fields are missing",
            })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).json({
                message: "Invalid Password",
            })
        }
        const payload = {
            id: user._id,
            email: user.email,
        }
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );
        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        return res.status(200).cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        }).cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).json({
            message: 'login success',
            accessToken, refreshToken
        })



    } catch (error) {
        next(error);

    }
}
export const refreshToken = async (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(400).json({
                message: "Refresh token Not found",

            })
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        } catch (error) {
            return res.status(400).json({
                message: "Invalid Refresh token",
            })

        }
        const refToken = await RefreshToken.findOne({
            userId: decoded.id,
        });
        if (!refToken) {
            return res.status(400).json({
                message: "Refresh token not found"
            })
        };
        const payload = {
            id: refToken.userId,
            email: decoded.email
        };
        await RefreshToken.deleteOne({ token: token });
        const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        const newRefreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        await RefreshToken.create({
            userId: refToken.userId,
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        return res.status(200).cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        }).cookie("refreshToken", newrefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).json({
            message: "token Refresh Done",
            newAccessToken,
            newRefreshToken

        })


    } catch (error) {
        next(error);

    }


}
export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh Token is not Found",
        })
    }
    await RefreshToken.deleteOne({ token: refreshToken });
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({
        message: "Token is Logged out successfully",
    })


}
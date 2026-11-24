import { User } from "../models/user"
import { HttpError } from "../util/httpError"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { RefreshToken } from "../models/refreshToken"
import crypto from "crypto"
import errors from "../util/errorsContants"
import { NextFunction, Request, Response } from "express"
import { env } from "../config/env"
import { TloginSchema, TsignupSchema } from "../schemas/auth.schema"

const TEST_HASH = bcrypt.hashSync("fakepassword", 10)

class AuthController {
  async signup(
    req: Request<never, never, TsignupSchema>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const existantUser = await User.findOne({ email: req.body.email })
      if (existantUser) {
        return next(new HttpError(400, errors.AUTH.EMAIL_ALREADY_EXISTS))
      }
      const user = new User(req.body)
      user.password = await bcrypt.hash(user.password, 10)
      await user.save()
      const userObject = user.toObject() as any
      delete userObject.password
      res.status(201).json(userObject)
    } catch (error: any) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR, error.stack))
    }
  }

  async login(
    req: Request<never, never, TloginSchema>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = await User.findOne({ email: req.body.email })
      if (!user) {
        await bcrypt.compare(req.body.password, TEST_HASH) // fake check for timing attack https://en.wikipedia.org/wiki/Timing_attack
        return next(new HttpError(401, errors.AUTH.INVALID_CREDENTIAL))
      }
      const isMatch = await bcrypt.compare(req.body.password, user.password)
      if (!isMatch) {
        return next(new HttpError(401, errors.AUTH.INVALID_CREDENTIAL))
      }
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: "15min" },
      )
      const refreshToken = crypto.randomBytes(64).toString("hex")
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      const newRefreshToken = new RefreshToken({
        token: refreshToken,
        user: user._id,
        expiresAt,
      })
      await newRefreshToken.save()
      const userObject = user.toObject() as any
      delete userObject.password
      res
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          // secure: process.env.NODE_ENV === "production", don't need for now because we are in dev
          sameSite: "strict",
          expires: expiresAt,
        })
        .json({ token, user: userObject })
    } catch (error: any) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR, error.stack))
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const { refreshToken: requestToken } = req.cookies

    if (!requestToken) {
      return next(new HttpError(400, errors.AUTH.REFRESH_TOKEN_REQUIRED))
    }

    try {
      const refreshToken = await RefreshToken.findOne({ token: requestToken })

      if (!refreshToken) {
        return next(new HttpError(401, errors.AUTH.INVALID_REFRESH_TOKEN))
      }

      if (refreshToken.expiresAt < new Date()) {
        await RefreshToken.findByIdAndDelete(refreshToken._id)
        return next(new HttpError(401, errors.AUTH.REFRESH_TOKEN_EXPIRED))
      }

      const user = await User.findById(refreshToken.user)
      if (!user) {
        return next(new HttpError(401, errors.AUTH.INVALID_USER))
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: "15min" },
      )

      const newRefreshTokenString = crypto.randomBytes(64).toString("hex")
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      const newRefreshToken = new RefreshToken({
        token: newRefreshTokenString,
        user: user._id,
        expiresAt,
      })

      await RefreshToken.findByIdAndDelete(refreshToken._id)
      await newRefreshToken.save()

      res
        .cookie("refreshToken", newRefreshTokenString, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          expires: expiresAt,
        })
        .json({ token })
    } catch (error: any) {
      next(new HttpError(500, errors.INTERNAL_SERVER_ERROR, error.stack))
    }
  }
  async getUserByEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email }).select("-password");
    
    if (!user) {
      return next(new HttpError(404, errors.AUTH.INVALID_USER));
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    next(new HttpError(500, errors.INTERNAL_SERVER_ERROR, error.stack));
  }
}




  
}

export default new AuthController()

import type { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../lib/jwt.js"

declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: string
			}
		}
	}
}

export function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const authHeader = req.headers.authorization

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		res.status(401).json({ error: "Missing or invalid authorization header" })
		return
	}

	const token = authHeader.substring(7)
	const payload = verifyAccessToken(token)

	if (!payload) {
		res.status(401).json({ error: "Invalid or expired token" })
		return
	}

	req.user = { userId: payload.userId }
	next()
}

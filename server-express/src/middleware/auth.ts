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

export function authenticateRequest(
	req: Pick<Request, "headers">,
): { userId: string } | null {
	const authHeader = req.headers.authorization

	if (!authHeader?.startsWith("Bearer ")) {
		return null
	}

	const token = authHeader.substring(7)
	const payload = verifyAccessToken(token)

	if (!payload) {
		return null
	}

	return { userId: payload.userId }
}

export function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const user = authenticateRequest(req)

	if (!user) {
		res.status(401).json({ error: "Missing or invalid authorization header" })
		return
	}

	req.user = user
	next()
}

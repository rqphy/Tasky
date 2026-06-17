import jwt from "jsonwebtoken"
import crypto from "crypto"

const ACCESS_TOKEN_SECRET =
	process.env.ACCESS_TOKEN_SECRET || "dev-secret-change-in-production"
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m"
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d"

function parseExpiryToSeconds(expiry: string): number {
	const match = expiry.match(/^(\d+)([dhms])$/)
	if (!match) return 7 * 24 * 60 * 60
	const [, value, unit] = match
	const num = parseInt(value, 10)
	switch (unit) {
		case "d":
			return num * 24 * 60 * 60
		case "h":
			return num * 60 * 60
		case "m":
			return num * 60
		case "s":
			return num
		default:
			return 7 * 24 * 60 * 60
	}
}

export interface AccessTokenPayload {
	userId: string
}

export function generateAccessToken(userId: string): string {
	return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
		expiresIn: parseExpiryToSeconds(ACCESS_TOKEN_EXPIRY),
	})
}

export function generateRefreshToken(): string {
	return crypto.randomBytes(64).toString("hex")
}

export function getRefreshTokenExpiryDate(): Date {
	const seconds = parseExpiryToSeconds(REFRESH_TOKEN_EXPIRY)
	return new Date(Date.now() + seconds * 1000)
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
	try {
		const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload
		return payload
	} catch {
		return null
	}
}

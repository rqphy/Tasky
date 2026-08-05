import axios from "axios"
import { API_BASE_URL } from "./config.js"

// Don't throw on 4xx/5xx — lets us test error responses
export const api = axios.create({
	baseURL: API_BASE_URL,
	validateStatus: () => true,
})

export function authHeaders(accessToken: string) {
	return { Authorization: `Bearer ${accessToken}` }
}

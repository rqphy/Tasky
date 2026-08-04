import axios from "axios"
import { API_BASE_URL } from "../helpers/config.js"

export default async function globalSetup(): Promise<void> {
	try {
		const response = await axios.get(`${API_BASE_URL}/health`, {
			timeout: 3_000,
			validateStatus: () => true,
		})

		if (response.status !== 200) {
			throw new Error(`Unexpected status ${response.status}`)
		}
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Unknown connection error"

		throw new Error(
			[
				`Cannot reach the API at ${API_BASE_URL}/health (${message}).`,
				"Start the test server first:",
				"  cd server-express && npm run dev:test",
			].join("\n"),
		)
	}
}

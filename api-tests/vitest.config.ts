import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		globalSetup: ["./src/setup/global-setup.ts"],
		testTimeout: 10_000,
	},
})

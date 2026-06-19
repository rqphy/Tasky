import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	type ReactNode,
} from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
	type User,
	login as apiLogin,
	register as apiRegister,
	logout as apiLogout,
	getCurrentUser,
	isAuthenticated as checkIsAuthenticated,
	clearTokens,
} from "@/lib/auth"

interface AuthContextType {
	user: User | null
	isAuthenticated: boolean
	isLoading: boolean
	login: (email: string, password: string) => Promise<void>
	register: (name: string, email: string, password: string) => Promise<void>
	logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const queryClient = useQueryClient()

	const checkAuth = useCallback(async () => {
		if (!checkIsAuthenticated()) {
			setIsLoading(false)
			return
		}

		try {
			const currentUser = await getCurrentUser()
			setUser(currentUser)
		} catch {
			clearTokens()
			setUser(null)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		checkAuth()
	}, [checkAuth])

	const login = async (email: string, password: string) => {
		const response = await apiLogin(email, password)
		setUser(response.user)
	}

	const register = async (name: string, email: string, password: string) => {
		const response = await apiRegister(name, email, password)
		setUser(response.user)
	}

	const logout = async () => {
		await apiLogout()
		setUser(null)
		queryClient.clear()
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				isLoading,
				login,
				register,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}

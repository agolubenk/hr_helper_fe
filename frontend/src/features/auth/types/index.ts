export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

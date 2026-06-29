export interface User {
    id: number
    username: string
    email: string
    created_at: string
}

export interface TokenResponse {
    access_token: string
    token_type: string
    user: User
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    username: string
    email: string
    password: string
}
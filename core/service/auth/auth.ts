import Api from "../api"
import type { LoginCredentials, LoginResponse, ProfileResponse, OutletResponse } from "./types"

class AuthClass extends Api {
    resource = "/auth"

    login = async (data: LoginCredentials): Promise<LoginResponse> => {
        return await this.post(`/api/auth/login`, {
            email: data.identity,
            password: data.password
        })
    }

    getProfile = async (): Promise<ProfileResponse> => {
        return await this.get(`/api/auth/me`)
    }

    getOutlet = async (): Promise<OutletResponse> => {
        return await this.get(`/api/auth/my-outlets`)
    }

    /* refreshToken = async (): Promise<LoginResponse> => {
    return await this.put(`${this.resource}/refresh-token`, )
    } */
}

const authApi = new AuthClass()
export default authApi
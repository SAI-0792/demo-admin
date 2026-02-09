import axios, { AxiosInstance, AxiosRequestConfig } from "axios"

// Create a shared axios instance
export const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

export default class Api {
    // Use the shared instance
    protected client: AxiosInstance = axiosInstance

    get = async (url: string, config?: AxiosRequestConfig) => {
        const response = await this.client.get(url, config)
        return response.data
    }

    post = async (url: string, data: any, config?: AxiosRequestConfig) => {
        const response = await this.client.post(url, data, config)
        return response.data
    }

    put = async (url: string, data: any, config?: AxiosRequestConfig) => {
        const response = await this.client.put(url, data, config)
        return response.data
    }

    delete = async (url: string, config?: AxiosRequestConfig) => {
        const response = await this.client.delete(url, config)
        return response.data
    }
}
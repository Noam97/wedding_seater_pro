import axios from 'axios'
import { useStore } from "@/store/index.js";
import {useRouter} from "vue-router";

const apiPort = 3200

const axiosInstance = axios.create({
    baseURL: `http://localhost:${apiPort}/api`,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        // @TODO check which page we are now, and send the token just when we need it
        const store = useStore()
        const token = store.getToken
        if (token) {
            config.headers['Authorization'] = token
        }

        return config
    },
    (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const store = useStore()
        if (error.response) {
            if (error.response.status === 403) {
                await store.logout()
                console.log('403 - so user will logout')
            }
            throw error // Always throw the error, regardless of the status code
        }

        return Promise.reject(error) // Handle cases where the response is not available
    }
)

export {
    axiosInstance,
}
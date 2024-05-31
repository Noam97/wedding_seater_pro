import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { axiosInstance } from "@/helper/axios.js"

export const useStore = defineStore('store', () => {
    const user = localStorage.getItem('user') === null ?
        ref(null) :
        ref(JSON.parse(localStorage.getItem('user')))

    const getToken = computed(() => user)
    async function createUser(payload) {
        return await axiosInstance.post('/register', payload)
    }

    async function login(payload) {
        return await axiosInstance.post('/login', payload)
    }


    function saveUserInLocalStorage(newUser) {
        user.value = newUser
        localStorage.setItem('user', JSON.stringify(user.value))
    }

    function logout() {
        localStorage.removeItem('user')
    }

    return {
        getToken,

        createUser,
        login,
        saveUserInLocalStorage,
        logout
    }
})
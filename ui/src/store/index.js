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

    async function createGuest(payload) {
        return await axiosInstance.post('/guests', payload)
    }

    async function getGuests() {
        return await axiosInstance.get('/guests')
    }

    async function createTable(payload) {
        return await axiosInstance.post('/tables', payload)
    }

    async function getTables() {
        return await axiosInstance.get('/tables')
    }

    async function generateTables() {
        return await axiosInstance.get('/tables/generate')
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
        createGuest,
        getGuests,
        createTable,
        getTables,
        generateTables,
        saveUserInLocalStorage,
        logout
    }
})
import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { axiosInstance } from "@/helper/axios.js"

export const useStore = defineStore('store', () => {
    const token = localStorage.getItem('token') === null ?
        ref(null) :
        ref(JSON.parse(localStorage.getItem('token')))

    const getToken = computed(() => token.value)

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

    async function deleteGuest(id) {
        return await axiosInstance.delete(`/guests/${id}`)
    }

    async function updateGuest(id, payload) {
        return await axiosInstance.put(`/guests/${id}`, payload)
    }
    async function createTable(payload) {
        return await axiosInstance.post('/tables', payload)
    }

    async function getTables() {
        return await axiosInstance.get('/tables')
    }


    async function updateTable(id, payload) {
        return await axiosInstance.put(`/tables/${id}`, payload)
    }

    async function deleteTable(tableNumber) {
        return await axiosInstance.delete(`/tables/${tableNumber}`)
    }

    async function generateTables() {
        return await axiosInstance.post('/tables/generate')
    }

    function saveUserInLocalStorage(newToken) {
        token.value = newToken
        localStorage.setItem('token', JSON.stringify(token.value))
    }

    function saveStateInLocalStorage(result){
        localStorage.setItem('seatingArrangement', JSON.stringify(result));
    }

    async function saveSeatingArrangement(tables) {
        return await axiosInstance.post('/tables/save', { tables });
    }

    async function rearrangeSeatingArrangements() {
        return await axiosInstance.get('/regenerate-seating');
    }

    function removeStateFromLocalStorage(){
        localStorage.removeItem('seatingArrangement');
    }

    function logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('seatingArrangement');
    }

    return {
        getToken,
        createUser,
        login,
        createGuest,
        getGuests,
        deleteGuest,
        updateGuest,
        createTable,
        updateTable,
        deleteTable,
        getTables,
        rearrangeSeatingArrangements,
        saveStateInLocalStorage,
        saveSeatingArrangement,
        removeStateFromLocalStorage,
        generateTables,
        saveUserInLocalStorage,
        logout
    }
})
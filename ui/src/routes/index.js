import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import {useStore} from "@/store/index.js";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/Register.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/Login.vue')
        },
        {    path: '/table',
            name: 'table',    component: () => import('../views/Table.vue')
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const pageAuthRequired = !(['/login', '/register'].includes(to.path))
    const token = useStore().getToken

    if (pageAuthRequired && !token) {
        console.debug(
            'auth required and no user object... redirecting to login'
        )
        return next({ name: 'login' })
    }

    next()
})

export default router
import { defineStore } from 'pinia'
import HTTP from '@/utils/http'

import { useGetCurrentUser } from '@/composables/auth/useAuthService'

export const useAuthStore = defineStore('auth', {
    state: () => ({ user: null, isLoggedIn: undefined, error: null }),

    actions: {
        async submitLogin(username, password) {
            const http = new HTTP()
            const response = await http.Post('/ui/v1/auth/login', { username, password })

            if (response.errors && response.errors.length > 0) {
                return response.errors[0]
            }

            // Refresh user state
            await this.login()
            return null
        },
        async logout() {
            const http = new HTTP()
            await http.Post('/logout')
            this.user = null
            this.isLoggedIn = false
        },
        async login() {
            const { user, error, load } = useGetCurrentUser()
            await load()
            if (!error.value) {
                this.user = user
                this.isLoggedIn = true
                return null
            } else {
                this.isLoggedIn = false
                this.user = null
                this.error = error
                return error.value
            }
        },
    },
})

<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h1 class="text-2xl font-bold text-center text-gray-900 dark:text-white">Sign in to Telescope</h1>
            
            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                    <InputText id="username" v-model="username" class="w-full mt-1" :invalid="!!error" />
                </div>
                
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <Password id="password" v-model="password" :feedback="false" toggleMask class="w-full mt-1" inputClass="w-full" :invalid="!!error" />
                </div>

                <div v-if="error" class="text-red-500 text-sm text-center">
                    {{ error }}
                </div>

                <Button type="submit" label="Sign In" class="w-full" :loading="loading" />
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
    loading.value = true
    error.value = ''
    
    try {
        const result = await authStore.submitLogin(username.value, password.value)
        if (result) {
            error.value = result
        } else {
            router.push('/')
        }
    } catch (e) {
        error.value = 'An unexpected error occurred'
        console.error(e)
    } finally {
        loading.value = false
    }
}
</script>

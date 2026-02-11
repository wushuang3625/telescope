<template>
    <Content>
        <template #header>
            <Header>
                <template #title>
                    <i class="pi pi-user-plus mr-3 text-3xl"></i>
                    Users
                </template>
            </Header>
        </template>
        <template #content>
            <div class="max-w-7xl">
                <Header>
                    <template #title>Create New User</template>
                </Header>
                <div class="border radius-lg p-6 dark:border-neutral-600 mt-4">
                    <div class="flex flex-col gap-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="flex flex-col">
                                <FloatLabel variant="on">
                                    <InputText
                                        id="username"
                                        v-model="userData.username"
                                        fluid
                                        :invalid="fieldErrors.username != ''"
                                    />
                                    <label for="username">Username</label>
                                </FloatLabel>
                                <ErrorText :text="fieldErrors.username" />
                            </div>

                            <div class="flex flex-col">
                                <FloatLabel variant="on">
                                    <InputText
                                        id="email"
                                        v-model="userData.email"
                                        fluid
                                        :invalid="fieldErrors.email != ''"
                                    />
                                    <label for="email">Email</label>
                                </FloatLabel>
                                <ErrorText :text="fieldErrors.email" />
                            </div>

                            <div class="flex flex-col">
                                <FloatLabel variant="on">
                                    <InputText
                                        id="first_name"
                                        v-model="userData.first_name"
                                        fluid
                                        :invalid="fieldErrors.first_name != ''"
                                    />
                                    <label for="first_name">First Name</label>
                                </FloatLabel>
                                <ErrorText :text="fieldErrors.first_name" />
                            </div>

                            <div class="flex flex-col">
                                <FloatLabel variant="on">
                                    <InputText
                                        id="last_name"
                                        v-model="userData.last_name"
                                        fluid
                                        :invalid="fieldErrors.last_name != ''"
                                    />
                                    <label for="last_name">Last Name</label>
                                </FloatLabel>
                                <ErrorText :text="fieldErrors.last_name" />
                            </div>

                            <div class="flex flex-col">
                                <FloatLabel variant="on">
                                    <Password
                                        id="password"
                                        v-model="userData.password"
                                        fluid
                                        :invalid="fieldErrors.password != ''"
                                        toggleMask
                                    />
                                    <label for="password">Password</label>
                                </FloatLabel>
                                <ErrorText :text="fieldErrors.password" />
                            </div>
                        </div>

                        <div class="flex justify-end gap-2 mt-4">
                            <Button
                                severity="secondary"
                                label="Cancel"
                                icon="pi pi-times"
                                @click="router.push({ name: 'rbacUsers' })"
                                size="small"
                            />
                            <Button
                                severity="primary"
                                label="Create"
                                icon="pi pi-check"
                                @click="handleCreate"
                                :loading="loading"
                                size="small"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </Content>
</template>

<script setup>
/**
 * User creation component for administrators.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'

import Content from '@/components/common/Content.vue'
import Header from '@/components/common/Header.vue'
import ErrorText from '@/components/common/ErrorText.vue'
import { useCreateUser } from '@/composables/rbac/useUserService'

const router = useRouter()
const toast = useToast()
const userData = ref({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
})
const fieldErrors = ref({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
})

const { create, loading, validation } = useCreateUser()

/**
 * Handle user creation request.
 */
const handleCreate = async () => {
    // Reset field errors
    for (const key in fieldErrors.value) {
        fieldErrors.value[key] = ''
    }

    const response = await create(userData.value)
    response.sendToast(toast)

    if (response.result) {
        if (!validation.value.result) {
            for (const column in validation.value.columns) {
                fieldErrors.value[column] = validation.value.columns[column].join(', ')
            }
        } else {
            router.push({ name: 'rbacUsers' })
        }
    }
}
</script>

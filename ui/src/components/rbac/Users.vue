<template>
    <AccessDenied v-if="!hasPermission" message="You don't have permission to access RBAC settings." />
    <Content v-else>
        <template #header>
            <ListHeader>
                <template #title>
                    <div class="flex items-center">
                        <Users class="mr-3 w-8 h-8" />
                        Users
                    </div>
                </template>
                <template #actions>
                    <Button
                        label="New User"
                        icon="pi pi-user-plus"
                        size="small"
                        severity="primary"
                        @click="router.push({ name: 'rbacUserNew' })"
                    />
                </template>
            </ListHeader>
        </template>
        <template #content>
            <DataView :loadings="[loading]" :errors="[error]">
                <template #loader>
                    <ContentBlock header="Users" :collapsible="false">
                        <SkeletonList :columns="6" :rows="10" />
                    </ContentBlock>
                </template>
                <ContentBlock :header="`Users: ${users.length}`" :collapsible="false">
                    <DataTable
                        :value="usersWithGroupNames"
                        filterDisplay="row"
                        v-model:filters="filters"
                        sortField="username"
                        removableSort
                        size="small"
                        :sortOrder="1"
                        :paginator="users.length > 50"
                        :rows="50"
                        :rowsPerPageOptions="[10, 25, 50, 100, 1000]"
                        :row-hover="true"
                        :globalFilterFields="['username', 'groupNames']"
                    >
                        <Column
                            field="id"
                            :sortable="true"
                            header="ID"
                            :showFilterMenu="false"
                            class="w-20 pl-4"
                        ></Column>
                        <Column
                            field="username"
                            :sortable="true"
                            header="Username"
                            :showFilterMenu="false"
                            class="w-40 text-nowrap font-medium"
                        >
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText
                                    v-model="filterModel.value"
                                    @input="filterCallback()"
                                    placeholder="Filter by username..."
                                    size="small"
                                    fluid
                                />
                            </template>
                        </Column>
                        <Column
                            field="displayFull"
                            :sortable="true"
                            header="Name"
                            filterField="fullName"
                            :showFilterMenu="false"
                            class="w-40 text-nowrap"
                        >
                            <template #body="{ data }">
                                {{ data.displayFirstName }} {{ data.displayLastName }}
                            </template>
                            <template #filter="{ filterModel, filterCallback }">
                                <InputText
                                    v-model="filterModel.value"
                                    @input="filterCallback()"
                                    placeholder="Filter by name..."
                                    size="small"
                                    fluid
                                />
                            </template>
                        </Column>
                        <Column
                            field="displayGroups"
                            :sortable="true"
                            header="Groups"
                            filterField="groupNames"
                            :showFilterMenu="false"
                            class="min-w-64"
                        >
                            <template #body="slotProps">
                                <div class="flex flex-wrap gap-2">
                                    <Tag
                                        v-for="group in getDisplayedGroups(slotProps.data)"
                                        :key="group.name"
                                        :value="group.name"
                                        severity="secondary"
                                    />
                                    <Badge
                                        v-if="slotProps.data.sortedGroups.length > 5 && !isExpanded(slotProps.data.id)"
                                        :value="`+${slotProps.data.sortedGroups.length - 5} more`"
                                        severity="secondary"
                                        size="large"
                                        class="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                                        @click="toggleExpanded(slotProps.data.id)"
                                    />
                                </div>
                            </template>
                            <template #filter="{ filterModel, filterCallback }">
                                <MultiSelect
                                    v-model="filterModel.value"
                                    @change="filterCallback()"
                                    :options="availableGroups"
                                    optionLabel="name"
                                    optionValue="name"
                                    placeholder="Filter by groups..."
                                    :maxSelectedLabels="1"
                                    fluid
                                    size="small"
                                    :showClear="true"
                                />
                            </template>
                        </Column>
                        <Column field="isActive" :sortable="true" header="Status">
                            <template #body="{ data }">
                                <BoolBadge :value="data.isActive" trueText="Active" falseText="Inactive" />
                            </template>
                        </Column>
                        <Column field="displayLastLogin" :sortable="true" header="Last login" class="text-nowrap">
                            <template #body="{ data }">
                                <DateTimeFormatted :value="data.lastLogin" />
                            </template>
                        </Column>
                        <Column header="Actions" class="w-32 text-right pr-4">
                            <template #body="{ data }">
                                <div class="flex justify-end gap-1">
                                    <Button
                                        icon="pi pi-key"
                                        v-tooltip.top="'Reset Password'"
                                        severity="secondary"
                                        variant="text"
                                        size="small"
                                        @click="openResetPasswordDialog(data)"
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        v-tooltip.top="'Delete User'"
                                        severity="danger"
                                        variant="text"
                                        size="small"
                                        @click="confirmDeleteUser(data)"
                                    />
                                </div>
                            </template>
                        </Column>
                        <template #empty>
                            <div
                                class="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400"
                            >
                                <Users class="w-10 h-10 mb-4 opacity-50" />
                                <p class="text-lg font-medium mb-2">No users found</p>
                            </div>
                        </template>
                    </DataTable>
                </ContentBlock>
            </DataView>
        </template>
    </Content>

    <!-- Reset Password Dialog -->
    <Dialog
        v-model:visible="resetPasswordVisible"
        header="Reset Password"
        :modal="true"
        :draggable="false"
        class="w-full max-w-md"
    >
        <div class="flex flex-col gap-4 py-4">
            <p class="text-sm text-gray-500 mb-2">
                Resetting password for <strong>{{ selectedUser?.username }}</strong>
            </p>
            <div class="flex flex-col gap-2">
                <FloatLabel variant="on">
                    <Password
                        id="new-password"
                        v-model="passwordData.password"
                        fluid
                        :invalid="resetFieldErrors.password != ''"
                        toggleMask
                    />
                    <label for="new-password">New Password</label>
                </FloatLabel>
                <ErrorText :text="resetFieldErrors.password" />
            </div>
            <div class="flex flex-col gap-2">
                <FloatLabel variant="on">
                    <Password
                        id="confirm-password"
                        v-model="passwordData.password_confirm"
                        fluid
                        :invalid="resetFieldErrors.password_confirm != ''"
                        toggleMask
                        :feedback="false"
                    />
                    <label for="confirm-password">Confirm Password</label>
                </FloatLabel>
                <ErrorText :text="resetFieldErrors.password_confirm" />
            </div>
        </div>
        <template #footer>
            <div class="flex justify-end gap-2">
                <Button
                    label="Cancel"
                    severity="secondary"
                    variant="text"
                    @click="resetPasswordVisible = false"
                    size="small"
                />
                <Button
                    label="Reset Password"
                    severity="primary"
                    @click="handleResetPassword"
                    :loading="resetLoading"
                    size="small"
                />
            </div>
        </template>
    </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { Users } from 'lucide-vue-next'
import { useDark } from '@vueuse/core'
import { FilterMatchMode } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Password from 'primevue/password'
import FloatLabel from 'primevue/floatlabel'
import { Badge, MultiSelect } from 'primevue'

import Content from '@/components/common/Content.vue'
import ContentBlock from '@/components/common/ContentBlock.vue'
import DataView from '@/components/common/DataView.vue'
import ListHeader from '@/components/common/ListHeader.vue'
import SkeletonList from '@/components/common/SkeletonList.vue'
import BoolBadge from '@/components/common/BoolBadge.vue'
import Tag from '@/components/common/Tag.vue'
import DateTimeFormatted from '@/components/common/DateTimeFormatted.vue'
import AccessDenied from '@/components/common/AccessDenied.vue'
import ErrorText from '@/components/common/ErrorText.vue'

import { useGetUsers, useDeleteUser, useResetPassword } from '@/composables/rbac/useUserService'
import { useGetGroups } from '@/composables/rbac/useGroupService'

const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const { user } = storeToRefs(useAuthStore())

const hasPermission = computed(() => {
    return user.value?.hasAccessToSettings() || false
})

const filters = ref({
    username: { value: null, matchMode: FilterMatchMode.CONTAINS },
    fullName: { value: null, matchMode: FilterMatchMode.CONTAINS },
    groupNames: {
        value: null,
        matchMode: FilterMatchMode.CUSTOM,
        constraint: (value, filter) => {
            if (!filter || filter.length === 0) return true
            if (!value || !Array.isArray(value)) return false
            return filter.some((selectedGroup) => value.includes(selectedGroup))
        },
    },
})

const { users, error, loading, load: reloadUsers } = useGetUsers()
const { groups } = useGetGroups()
const { remove: deleteUser } = useDeleteUser()
const { reset: resetUserPassword, loading: resetLoading, validation: resetValidation } = useResetPassword()

// Dialog states
const resetPasswordVisible = ref(false)
const selectedUser = ref(null)
const passwordData = ref({
    password: '',
    password_confirm: '',
})
const resetFieldErrors = ref({
    password: '',
    password_confirm: '',
})

// Track expanded state for each user's groups
const expandedUserGroups = ref(new Set())

const availableGroups = computed(() => {
    if (!groups.value) return []
    return groups.value.map((group) => ({ name: group.name }))
})

// Transform users to include groupNames and fullName for filtering
const usersWithGroupNames = computed(() => {
    if (!users.value) return []
    return users.value.map((user) => {
        // Create a new object that preserves all properties including getters
        const userWithGroupNames = Object.create(Object.getPrototypeOf(user))
        Object.assign(userWithGroupNames, user)
        userWithGroupNames.groupNames = user.groups.map((group) => group.name)
        userWithGroupNames.fullName = `${user.displayFirstName} ${user.displayLastName}`.trim()
        return userWithGroupNames
    })
})

// Check if a user's groups are expanded
const isExpanded = (userId) => {
    return expandedUserGroups.value.has(userId)
}

// Expand a user's groups (one-way only)
const toggleExpanded = (userId) => {
    expandedUserGroups.value.add(userId)
}

// Get the groups to display for a user (either first 5 or all)
const getDisplayedGroups = (user) => {
    if (isExpanded(user.id) || user.sortedGroups.length <= 5) {
        return user.sortedGroups
    }
    return user.sortedGroups.slice(0, 5)
}

/**
 * Open the reset password dialog for a user.
 */
const openResetPasswordDialog = (user) => {
    selectedUser.value = user
    passwordData.value = { password: '', password_confirm: '' }
    resetFieldErrors.value = { password: '', password_confirm: '' }
    resetPasswordVisible.value = true
}

/**
 * Handle password reset submission.
 */
const handleResetPassword = async () => {
    resetFieldErrors.value = { password: '', password_confirm: '' }
    const response = await resetUserPassword(selectedUser.value.id, passwordData.value)
    response.sendToast(toast)

    if (response.result) {
        if (!resetValidation.value.result) {
            for (const column in resetValidation.value.columns) {
                resetFieldErrors.value[column] = resetValidation.value.columns[column].join(', ')
            }
        } else {
            resetPasswordVisible.value = false
        }
    }
}

/**
 * Confirm user deletion.
 */
const confirmDeleteUser = (user) => {
    confirm.require({
        message: `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`,
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true,
        },
        acceptProps: {
            label: 'Delete',
            severity: 'danger',
        },
        accept: async () => {
            const response = await deleteUser(user.id)
            response.sendToast(toast)
            if (response.result) {
                reloadUsers()
            }
        },
    })
}
</script>

import { ref } from 'vue'
import { User } from '@/sdk/models/rbac'
import { UserService } from '@/sdk/services/user'

const srv = new UserService()

const useGetUsers = () => {
    const users = ref(null)
    const loading = ref(null)
    const error = ref(null)

    const load = async () => {
        loading.value = true
        let response = await srv.getUsers()
        if (response.result) {
            users.value = response.data.map((item) => new User(item))
        }
        error.value = response.errors.join(', ')
        loading.value = false
    }
    load()
    return { users, error, loading, load }
}

const useGetSimpleUsers = () => {
    const users = ref(null)
    const loading = ref(null)
    const error = ref(null)

    const load = async () => {
        loading.value = true
        let response = await srv.getSimpleUsers()
        if (response.result) {
            users.value = response.data.map((item) => new User(item))
        }
        error.value = response.errors.join(', ')
        loading.value = false
    }
    load()
    return { users, error, loading, load }
}

const useCreateUser = () => {
    const loading = ref(null)
    const error = ref(null)
    const validation = ref({ result: true, columns: {} })

    const create = async (data) => {
        loading.value = true
        let response = await srv.createUser(data)
        error.value = response.errors.join(', ')
        validation.value = response.validation
        loading.value = false
        return response
    }
    return { create, error, loading, validation }
}

const useDeleteUser = () => {
    const loading = ref(null)
    const error = ref(null)

    const remove = async (id) => {
        loading.value = true
        let response = await srv.deleteUser(id)
        error.value = response.errors.join(', ')
        loading.value = false
        return response
    }
    return { remove, error, loading }
}

const useResetPassword = () => {
    const loading = ref(null)
    const error = ref(null)
    const validation = ref({ result: true, columns: {} })

    const reset = async (id, data) => {
        loading.value = true
        let response = await srv.resetPassword(id, data)
        error.value = response.errors.join(', ')
        validation.value = response.validation
        loading.value = false
        return response
    }
    return { reset, error, loading, validation }
}

export { useGetUsers, useGetSimpleUsers, useCreateUser, useDeleteUser, useResetPassword }

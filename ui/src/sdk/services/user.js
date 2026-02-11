import HTTP from '@/utils/http'

const http = new HTTP()

class UserService {
    getUsers = async () => {
        let response = await http.Get('ui/v1/rbac/users')
        return response
    }
    getSimpleUsers = async () => {
        let response = await http.Get('ui/v1/rbac/simpleusers')
        return response
    }
    createUser = async (data) => {
        let response = await http.Post('ui/v1/rbac/users', data)
        return response
    }
    deleteUser = async (id) => {
        let response = await http.Delete(`ui/v1/rbac/users/${id}`)
        return response
    }
    resetPassword = async (id, data) => {
        let response = await http.Patch(`ui/v1/rbac/users/${id}`, data)
        return response
    }
}
export { UserService }

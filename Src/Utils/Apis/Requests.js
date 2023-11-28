import instance from "../Api/instance";
const post_request = async ({ target, body }) => {
    try {
        const response = await instance.post(target, body)
        return response
    } catch (error) {
        const err = error ;
        if (err.response) {
           return err.response.data;
        }
    }
}
const get_request = async ({ target }) => {
    try {
        const response = await instance.get(target)
        return response
    } catch (error) {
        return error
    }
}
const put_request = async ({ target, body }) => {
    try {
        const response = await instance.put(target, body)
        return response
    } catch (error) {
        return "Error"
    }
}

export { post_request, get_request, put_request }

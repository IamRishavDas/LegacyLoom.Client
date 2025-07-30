
const API_BASE_URL = "https://localhost:7210/gateway/api"
const URLS = {
    REGISTER: `${API_BASE_URL}/users`,
    LOGIN_USERNAME: `${API_BASE_URL}/auth/login/username`,
    LOGIN_EMAIL: `${API_BASE_URL}/auth/login/email`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    CREATE_TIMELINE: `${API_BASE_URL}/timelines`,
    GET_MY_TIMELINES: (pageNumber, pageSize, orderBy) => `${API_BASE_URL}/timelines/my-timelines?PageNumber=${pageNumber ?? 1}&PageSize=${pageSize ?? 10}&OrderBy=${orderBy ?? ""}`,
    GET_MY_TIMELINE_BY_ID: (id) => `${API_BASE_URL}/timelines/my-timelines/${id}`
}

export default URLS;

const API_BASE_URL = "https://localhost:7210/gateway/api"
const URLS = {
    REGISTER: `${API_BASE_URL}/users`,
    LOGIN_USERNAME: `${API_BASE_URL}/auth/login/username`,
    LOGIN_EMAIL: `${API_BASE_URL}/auth/login/email`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    GET_MY_TIMELINES: `${API_BASE_URL}/timelines/my-timelines`,
    CREATE_TIMELINE: `${API_BASE_URL}/timelines`
}

export default URLS;
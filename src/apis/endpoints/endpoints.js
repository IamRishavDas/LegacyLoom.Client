
const API_BASE_URL = import.meta.env.VITE_LEGACY_LOOM_API_GATEWAY;
const URLS = {
    REGISTER: `${API_BASE_URL}/users`,
    LOGIN_USERNAME: `${API_BASE_URL}/auth/login/username`,
    LOGIN_EMAIL: `${API_BASE_URL}/auth/login/email`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    CREATE_TIMELINE: `${API_BASE_URL}/timelines`,
    GET_MY_TIMELINES: (pageNumber, pageSize, orderBy) => `${API_BASE_URL}/timelines/my-timelines?PageNumber=${pageNumber ?? 1}&PageSize=${pageSize ?? 10}&OrderBy=${orderBy ?? "lastModified desc"}`,
    GET_MY_TIMELINE_BY_ID: (id) => `${API_BASE_URL}/timelines/my-timelines/${id}`,
    GET_PUBLIC_FEED: (pageNumber, pageSize, orderBy) => `${API_BASE_URL}/timelines/public?PageNumber=${pageNumber ?? 1}&PageSize=${pageSize ?? 10}&OrderBy=${orderBy ?? "lastModified desc"}`,
    GET_PUBLIC_TIMELINE: (id) => `${API_BASE_URL}/timelines/public/${id}`,
    DELETE_MY_TIMELINE: (id) => `${API_BASE_URL}/timelines/${id}`
}

export default URLS;
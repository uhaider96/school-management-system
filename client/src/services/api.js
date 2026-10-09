import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Automatic JWT Bearer Token Injector for Protected Requests
API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
});

export default API;
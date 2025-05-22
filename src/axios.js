import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

axios.defaults.baseURL = apiUrl;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// if there is no access token saved in local storage, then redirect to login page
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// if there is any axios reponse with status code of 401, then redirect to login page
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Import dynamically to avoid circular dependency
            import('./service/session').then(({ handleSessionExpired }) => {
                handleSessionExpired();
            });
        }
        return Promise.reject(error);
    }
);

// if there is any axios reponse with status code of 403 (forbidden), then redirect to access denied page
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status === 403) {
            window.location.href = '/auth/access';
        }

        return Promise.reject(error);
    }
);

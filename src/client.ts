import axios from 'axios';

export const client = axios.create({
	baseURL: `https://api.plan.toggl.space/api/v6-rc1`,
});

client.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers['Authorization'] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

client.interceptors.response.use(
	(response) => {
		// If the response is successful, just return the response
		return response;
	},
	async (error) => {
		const token = localStorage.getItem('token');
		const originalRequest = error.config;

		// Check if the error is due to an expired token
		if (error.response.status === 401 && !originalRequest._retry) {
			if (!!token && isTokenExpired(token)) {
				originalRequest._retry = true; // Mark that we are now trying to refresh the token to avoid infinite loops

				try {
					const { token } = await refreshToken(); // Implement refreshToken to get a new token
					localStorage.setItem('token', token); // Update the stored token
					axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Update the default token
					return axios(originalRequest); // Retry the original request with the new token
				} catch (refreshError) {
					// If token refresh fails, redirect to login
					redirectToLogin();
					return Promise.reject(refreshError);
				}
			} else {
				// If the token doesn't exist or there's another error, redirect to login
				redirectToLogin();
			}
		}

		return Promise.reject(error);
	}
);

function isTokenExpired(token: string) {
	const payloadBase64 = token.split('.')[1];
	const decodedJson = atob(payloadBase64);
	const decoded = JSON.parse(decodedJson);
	const exp = decoded.exp;

	const now = Date.now() / 1000;
	return exp < now;
}

async function refreshToken() {
	try {
		const response = await axios.post(
			'https://accounts.toggl.space/api/oauth/token',
			{
				refresh_token: localStorage.getItem('refresh_token'),
				grant_type: 'refresh_token',
				client_id: localStorage.getItem('client_id'),
			}
		);

		const { access_token, refresh_token } = response.data;
		localStorage.setItem('token', access_token);
		localStorage.setItem('refresh_token', refresh_token);

		return access_token;
	} catch (error) {
		console.error('Error refreshing token:', error);
		throw error; // Rethrow to handle it in the calling context
	}
}

function redirectToLogin() {
	window.location.href = `https://api.plan.toggl.space/oauth/login/?client_id=${localStorage.getItem('client_id')}&response_type=code&redirect_uri=${encodeURIComponent('http://localhost:5173')}`;
}

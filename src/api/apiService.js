import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL configuration
const BASE_URL = 'http://167.71.195.57:8000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token from SecureStore:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// API endpoints
const endpoints = {
    otpRequest: '/api/otp-request/',  // Added trailing slash to match your API
    verifyOtp: '/api/login/',
    scanTicket: '/ticket/scan-ticket',
};

// API services
export const authService = {
    // Request OTP service
    requestOtp: async (data) => {
        try {
            const response = await apiClient.post(endpoints.otpRequest, data);
            console.log('API Response:', response.data);
            
            if (!response.data) {
                throw new Error('No data received from server');
            }
            
            return response.data;
        } catch (error) {
            console.error('OTP Request Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                request: error.config?.data
            });
            
            // If we have a response from the server
            if (error.response?.data) {
                throw {
                    message: error.response.data.message || 'Server error',
                    response: error.response
                };
            }
            
            throw {
                message: 'Network error. Please check your connection.',
                error: error
            };
        }
    },
    
    // Verify OTP service
    verifyOtp: async (data) => {
        try {
            const response = await apiClient.post(endpoints.verifyOtp, data);
            console.log('API Response (Verify OTP):', response.data);
            if (response.data?.access_token) {
                await SecureStore.setItemAsync('accessToken', response.data.access_token);
            }
            return response.data;
        } catch (error) {
            console.error('OTP Error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                request: error.config?.data
            });
            if (error.response?.data) {
                throw {
                    message: error.response.data.message || 'Server error',
                    response: error.response
                };
            }
            throw {
                message: 'Network error. Please check your connection.',
                error: error
            };
        }
    },
};

// Add ticket service
export const ticketService = {
    // Scan ticket service
    scanTicket: async (code) => {
        try {
            const response = await apiClient.post(`${endpoints.scanTicket}/${code}`);
            console.log('API Response:', response.data);
            return response.data;
        } catch (error) {
            if (error.response?.data) {
                throw {
                    message: error.response.data.message || 'Server error',
                    response: error.response
                };
            }
            throw {
                message: 'Network error. Please check your connection.',
                error: error
            };
        }
    },
};

// Example of another service group
// export const userService = {
//     // Get user profile
//     getProfile: async () => {
//         try {
//             const response = await apiClient.get('/user/profile');
//             return response.data;
//         } catch (error) {
//             throw error.response?.data || error.message;
//         }
//     },

//     // Update user profile
//     updateProfile: async (userData) => {
//         try {
//             const response = await apiClient.put('/user/profile', userData);
//             return response.data;
//         } catch (error) {
//             throw error.response?.data || error.message;
//         }
//     },
// };

// You can add more service groups as needed 
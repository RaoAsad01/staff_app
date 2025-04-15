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
    scanTicket: '/ticket/scan',
    staffEvents: '/organization/staff/events/', // Endpoint for fetching accessible events
    eventInfo: '/ticket/event/', // Base endpoint for event info by UUID
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
                console.log('Token stored successfully');
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
    scanTicket: async (code, note = null) => {
        try {
            // Clean the code if it contains any URL
            let cleanCode = code;
            
            // Remove any URL parts if present
            if (code.includes('scan-ticket/')) {
                cleanCode = code.split('scan-ticket/')[1];
            }
            
            // Remove any trailing slashes
            cleanCode = cleanCode.replace(/\/$/, '');
            
            console.log('Original code:', code);
            console.log('Cleaned code:', cleanCode);
            
            // Get current token for debugging
            const token = await SecureStore.getItemAsync('accessToken');
            console.log('Current token:', token);
            
            // Prepare request data
            const requestData = {
                note: note || null
            };
            
            // Log complete request details
            const requestUrl = `${endpoints.scanTicket}/${cleanCode}/`;
            console.log('Request Details:', {
                method: 'POST',
                url: requestUrl,
                baseURL: BASE_URL,
                fullUrl: `${BASE_URL}${requestUrl}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : 'No token'
                },
                data: requestData
            });
            
            const response = await apiClient.post(requestUrl, requestData);
            
            // Check if response is valid JSON
            if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
                throw new Error('Server returned HTML instead of JSON response');
            }
            
            console.log('Ticket Scan Response:', {
                success: response.data?.success || false,
                status: response.status,
                message: response.data?.message || 'No message received',
                data: response.data
            });

            if (response.data?.success || response.status === 200) {
                console.log('Ticket scan successful!');
                return response.data;
            } else {
                console.log('Ticket scan response indicates failure');
                throw {
                    message: response.data?.message || 'Scan failed',
                    response: response
                };
            }
        } catch (error) {
            console.error('Ticket Scan Error:', {
                status: error.response?.status,
                message: error.message,
                responseType: error.response?.headers?.['content-type'],
                isHtml: error.response?.data?.includes?.('<!DOCTYPE html>'),
                responseData: error.response?.data,
                requestUrl: error.config?.url,
                requestData: error.config?.data
            });
            
            if (error.response?.data) {
                throw {
                    message: error.response.data.message || 'Server error occurred. Please try again.',
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
export const eventService = {

  fetchStaffEvents: async () => {
        try {
            const response = await apiClient.get(endpoints.staffEvents);
            console.log('Fetch Staff Events Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Fetch Staff Events Error:', error);
            throw error;
        }
    },

    fetchEventInfo: async (eventUuid) => {
        try {
            const response = await apiClient.get(`${endpoints.eventInfo}${eventUuid}/info/`);
            console.log('Fetch Event Info Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Fetch Event Info Error:', error);
            throw error;
        }
    },

}
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
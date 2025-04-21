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
      // Skip auth for public endpoints
      const publicEndpoints = [endpoints.otpRequest, endpoints.verifyOtp];
  
      if (!publicEndpoints.some(endpoint => config.url?.includes(endpoint))) {
        try {
          const token = await SecureStore.getItemAsync('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting token from SecureStore:', error);
        }
      }
  
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  

// API endpoints
const endpoints = {
    otpRequest: '/api/otp-request/',
    verifyOtp: '/api/login/',
    scanTicket: '/ticket/scan/{event_uuid}/{ticket_code}/',
    staffEvents: '/organization/staff/events/',
    eventInfo: '/ticket/event/',
    updateNote: '/ticket/note/{event_uuid}/{code}/',
    userTicketOrdersManual: '/ticket/user-ticket/orders/',
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
    scanTicket: async (scannedData, note = null) => {
        try {
            let eventUuidFromScan = null;
            let ticketCodeFromScan = null;

            // Assuming the scanned data is a full URL like:
            // http://167.71.195.57:8000/ticket/scan/b25e2a8b-ebc4-4872-b7a3-347bef5466a5/R04LERYMWD79R2PI/
            if (scannedData.startsWith(BASE_URL) && scannedData.includes('/ticket/scan/')) {
                const parts = scannedData.split('/ticket/scan/')[1].split('/');
                if (parts.length >= 2) {
                    eventUuidFromScan = parts[0];
                    ticketCodeFromScan = parts[1];
                }
            }

            if (!eventUuidFromScan || !ticketCodeFromScan) {
                console.error('Could not extract event UUID and ticket code from scanned data:', scannedData);
                throw new Error('Invalid QR code format');
            }

            console.log('Scanned Data:', scannedData);
            console.log('Extracted Event UUID:', eventUuidFromScan);
            console.log('Extracted Ticket Code:', ticketCodeFromScan);

            const token = await SecureStore.getItemAsync('accessToken');
            console.log('Current token:', token);
            
            
            // Prepare request data

            // Prepare request data
            const requestData = {
                note: note || null,
            };

            // Construct URL using the extracted values
            const requestUrl = endpoints.scanTicket
                .replace('{event_uuid}', eventUuidFromScan)
                .replace('{ticket_code}', ticketCodeFromScan);

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
                data: requestData // eventUuid is NOT here
            });

            const response = await apiClient.post(requestUrl, requestData);
            return response.data

            // ... rest of your response handling ...

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
 // Update ticket note service
 updateTicketNote: async (code, note, eventUuid) => {
    try {
        const requestUrl = endpoints.updateNote
            .replace('{event_uuid}', eventUuid)
            .replace('{code}', code); // This part looks correct
            console.log('update note:', requestUrl);

        // ... (rest of the updateTicketNote function)
    } catch (error) {
        // ... (error handling)
    }
},

fetchUserTicketOrders: async () => {
    try {
        const response = await apiClient.get(endpoints.userTicketOrders);
        console.log('User Ticket Orders Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Fetch User Ticket Orders Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        });
        if (error.response?.data) {
            throw {
                message: error.response.data.message || 'Failed to fetch ticket orders.',
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
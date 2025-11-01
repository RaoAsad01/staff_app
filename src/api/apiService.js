import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Base URL configuration
const BASE_URL = 'https://d1-api.hexallo.com/';
//for dev orgainer const BASE_URL = 'https://d1-api.hexallo.com/';
//for dev admin  const BASE_URL = 'https://d1-admin.hexallo.com/';
//for prod orgainer const BASE_URL = 'https://t1-api.hexallo.com/';
//for prod admin  const BASE_URL = 'https://t1-admin.hexallo.com/';
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

// Response interceptor for handling auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // If we get a 401 Unauthorized response, the token is invalid/expired
    if (error.response?.status === 401) {
      try {
        // Clear the invalid token
        await SecureStore.deleteItemAsync('accessToken');
        console.log('Token expired or invalid, cleared from storage');

        // You could also dispatch a logout action here if using Redux
        // or trigger a navigation to login screen
      } catch (clearError) {
        console.error('Error clearing token:', clearError);
      }
    }

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
  userTicketOrdersManualDetail: (orderNumber, eventUuid) => `/ticket/user-ticket/?order_number=${orderNumber}&event_uuid=${eventUuid}`,
  manualDetailChekin: (uuid, code) => `/ticket/scan/${uuid}/${code}/`,
  ticketStats: '/ticket/',
  ticketStatslist: '/ticket/user-ticket/',
  ticketPricingStats: '/ticket/pricing-types/',
  ticketPricing: '/ticket/pricing/',
  boxOfficeGetTicket: '/order/box-office/',
  boxOfficeCheckInAllTicket: (eventUuid, orderNumber) => `/ticket/checkin-all/${eventUuid}/${orderNumber}/`,
  dashboardStats: '/events/{event_uuid}/sales/',
  userProfile: '/api/me/',
  logout: '/api/logout/',
  updateProfile: '/api/profile/',
  adminDashboardTerminals: '/events/terminals/',
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
      // https://dev-api.hexallo.com/ticket/scan/b25e2a8b-ebc4-4872-b7a3-347bef5466a5/R04LERYMWD79R2PI/
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

  fetchAdminTerminals: async (event_uuid) => {
    try {
      const response = await apiClient.get(`${endpoints.adminDashboardTerminals}?event=${event_uuid}`); // Include event_uuid as a query parameter
      console.log('Admin Dashboard Terminals Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Admin Dashboard Terminals Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch Admin Dashboard Terminals.',
          response: error.response
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        error: error
      };
    }
  },

  fetchUserTicketOrders: async (event_uuid) => {
    try {
      const response = await apiClient.get(`${endpoints.userTicketOrdersManual}?event_uuid=${event_uuid}`); // Include event_uuid as a query parameter
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

  fetchUserTicketOrdersDetail: async (orderNumber, eventUuid) => {
    try {
      const response = await apiClient.get(endpoints.userTicketOrdersManualDetail(orderNumber, eventUuid)); // Use the endpoint definition
      console.log('Ticket Details Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch Ticket Details Error:', error);
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch ticket orders Detail.',
          response: error.response
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        error: error
      };
    }
  },

  manualDetailCheckin: async (uuid, code) => {
    console.log("Manual Checkin Params:", uuid, code);
    try {
      const response = await apiClient.post(endpoints.manualDetailChekin(uuid, code));
      console.log('Manual Ticket Details Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch Manual Ticket Details Error:', error);
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch manual ticket orders Detail.',
          response: error.response
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        error: error
      };
    }
  },

  boxOfficeDetailCheckinAll: async (eventUuid, orderNumber) => {
    console.log("box office checkin all Params:", eventUuid, orderNumber);
    try {
      const response = await apiClient.patch(endpoints.boxOfficeCheckInAllTicket(eventUuid, orderNumber));
      console.log('box office checkin all Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('box office checkin all Details Error:', error);
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'box office checkin all error',
          response: error.response
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        error: error
      };
    }
  },

  ticketStatsInfo: async (eventUuid) => {
    try {
      const response = await apiClient.get(`${endpoints.ticketStats}${eventUuid}/stats/`);
      console.log(' Ticket Tab Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ticket stats:', error);
      throw error;
    }
  },

  ticketStatsListing: async (event_uuid, page = 1, staffUuid = null, status = 'PAID') => {
    try {
      let url = `${endpoints.ticketStatslist}?event_uuid=${event_uuid}&page=${page}&page_size=-1`;
      
      // Add status filter
      if (status) {
        url += `&status=${status}`;
      }

      // Add staff_uuid parameter if provided
      if (staffUuid) {
        url += `&staff_uuid=${staffUuid}`;
      }

      const response = await apiClient.get(url);
      console.log('Ticket Tab listing Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ticket stats:', error);
      throw error;
    }
  },
  fetchTicketPricingStats: async () => {
    try {
      const response = await apiClient.get(endpoints.ticketPricingStats);
      console.log('Ticket Pricing Stats API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch Ticket Pricing Stats Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch ticket pricing stats.',
          response: error.response
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        error: error
      };
    }
  },

  fetchTicketPricing: async (eventUuid) => {
    try {
      if (!eventUuid) {
        throw new Error('event_uuid is required');
      }

      console.log('Fetching ticket pricing for event:', eventUuid);
      const response = await apiClient.get(`${endpoints.ticketPricing}?event_uuid=${eventUuid}`);

      // Log the complete response
      console.log('Ticket Pricing API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        config: {
          url: response.config.url,
          method: response.config.method,
          headers: response.config.headers
        }
      });

      // Extract the actual pricing data from the nested structure
      const pricingData = response.data?.data?.data;

      // Log the data structure
      console.log('Ticket Pricing Data Structure:', {
        hasData: !!pricingData,
        eventTitle: pricingData?.event_title,
        pricingTypeOptions: pricingData?.pricing_type_options,
        saleStartDate: pricingData?.sale_start_date_time,
        saleEndDate: pricingData?.sale_end_date_time
      });

      return pricingData;
    } catch (error) {
      console.error('Fetch Ticket Pricing Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch ticket pricing.',
          response: error.response
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        error: error
      };
    }
  },

  fetchBoxOfficeGetTicket: async (eventUuid, items, userIdentifier, paymentMethod, transactionId = null, name = null, purchaseCode = null) => {
    try {
      // Add purchase_code to items if provided
      const itemsWithPurchaseCode = items.map(item => ({
        ...item,
        // Only add purchase_code if it's provided and not empty
        ...(purchaseCode && purchaseCode.trim() && { purchase_code: purchaseCode.trim() })
      }));

      const requestBody = {
        event: eventUuid,
        items: itemsWithPurchaseCode,
        user_identifier: userIdentifier,
        payment_method: paymentMethod,
        transaction_id: transactionId,
        name: name
      };

      console.log('BoxOffice get ticket request body:', requestBody);
      console.log('Purchase code being sent:', purchaseCode);
      console.log('Items with purchase code:', itemsWithPurchaseCode);
      const response = await apiClient.post(endpoints.boxOfficeGetTicket, requestBody);
      console.log('BoxOffice get ticket DetailsResponse:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        config: {
          url: response.config.url,
          method: response.config.method,
          headers: response.config.headers
        }
      });
      console.log('BoxOffice get ticket API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('BoxOffice get ticket Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
      if (error.response?.data) {
        console.log('BoxOffice Response:', error.response?.data);

        // Handle specific validation errors
        if (error.response.status === 400 && error.response.data?.data?.purchase_code) {
          const purchaseCodeErrors = error.response.data.data.purchase_code;
          if (Array.isArray(purchaseCodeErrors) && purchaseCodeErrors.length > 0) {
            console.error('Purchase code validation failed:', {
              purchaseCode: purchaseCode,
              errors: purchaseCodeErrors,
              fullResponse: error.response.data
            });
            throw {
              message: `Purchase code error: ${purchaseCodeErrors[0]}`,
              response: error.response,
              isPurchaseCodeError: true
            };
          }
        }

        throw {
          message: error.response.data.message || 'Failed to fetch get box office ticket',
          response: error.response
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        error: error
      };
    }
  },

  fetchDashboardStats: async (eventUuid, sales = null, ticketType = null, ticketUuid = null, staffUuid = null, paymentChannel = null) => {
    try {
      let url = endpoints.dashboardStats.replace('{event_uuid}', eventUuid);

      const params = new URLSearchParams();

      // Add sales query parameter for ADMIN users
      if (sales) {
        params.append('sales', sales);
      }

      // Add ticket_type query parameter for filtering by category
      if (ticketType) {
        params.append('ticket_type', ticketType);
      }

      // Add ticket_uuid query parameter for filtering specific ticket analytics
      if (ticketUuid) {
        params.append('ticket_uuid', ticketUuid);
      }

      // Add staff_uuid query parameter for staff-specific data
      if (staffUuid) {
        params.append('staff_uuid', staffUuid);
      }

      // Add payment_channel query parameter for filtering by payment channel
      if (paymentChannel) {
        params.append('payment_channel', paymentChannel);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // Log the API call details
      console.log('================================================');
      console.log('📡 API CALL - fetchDashboardStats');
      console.log('Base URL:', BASE_URL);
      console.log('Endpoint:', url);
      console.log('Full URL:', BASE_URL + url);
      console.log('HTTP Method: GET');
      console.log('Parameters:', {
        eventUuid,
        sales,
        ticketType,
        ticketUuid,
        staffUuid,
        paymentChannel
      });
      console.log('================================================');

      const response = await apiClient.get(url);

      console.log('✅ API Response received:', {
        status: response.status,
        hasData: !!response.data
      });

      return response.data;
    } catch (error) {
      console.error('❌ Fetch Dashboard Stats Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch dashboard stats.',
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

      // Handle the new response structure
      if (response.data?.success && response.data?.data && response.data.data.length > 0) {
        // Extract events from the first staff member's events array
        const staffData = response.data.data[0];
        if (staffData?.events && staffData.events.length > 0) {
          // Transform the events to match the expected format
          const transformedEvents = staffData.events.map(event => ({
            id: event.uuid,
            event_title: event.title,
            uuid: event.uuid,
            // Add other required fields with default values
            cityName: 'Accra', // Default location
            date: '28-12-2024', // Default date
            time: '7:00 PM', // Default time
            eventUuid: event.uuid
          }));

          // Return in the expected format
          return {
            data: transformedEvents
          };
        }
      }

      // Return empty array if no events found
      return { data: [] };
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
      console.error('Fetch Event Info Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });

      // Handle 403 Forbidden error specifically
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || error.response?.data?.data?.detail;

        // Check if it's a business logic error (like "Event is not published")
        if (errorMessage && errorMessage.includes('not published')) {
          console.error('403 Forbidden - Business logic error:', errorMessage);
          throw {
            message: errorMessage || 'Event is not available.',
            status: 403,
            isBusinessError: true,
            response: error.response
          };
        } else {
          // This might be an authentication error
          console.error('403 Forbidden - Possible authentication issue detected');
          // Clear the stored token as it might be invalid
          await SecureStore.deleteItemAsync('accessToken');
          throw {
            message: 'Authentication failed. Please login again.',
            status: 403,
            isAuthError: true,
            response: error.response
          };
        }
      }

      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch event info',
          response: error.response
        };
      }

      throw {
        message: 'Network error. Please check your connection.',
        error: error
      };
    }
  },

}
// Example of another service group
export const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get(endpoints.userProfile);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateProfile: async (formData) => {
    try {
      const response = await apiClient.patch(endpoints.updateProfile, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("image profile:", response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  Userlogout: async () => {
    try {
      const response = await apiClient.post(endpoints.logout);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
}
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
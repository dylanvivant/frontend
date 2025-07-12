import axios from 'axios';
import {
  getTokensSecurely,
  isValidJWTFormat,
  debugTokens,
} from '../utils/token';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Instance Axios principale
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  (config) => {
    const { token } = getTokensSecurely();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = getTokensSecurely();

        // Debug des tokens avant la tentative de refresh
        console.log('🔄 Tentative de refresh token');
        debugTokens();

        if (!refreshToken) {
          throw new Error('Aucun refresh token disponible');
        }

        if (!isValidJWTFormat(refreshToken)) {
          throw new Error('Refresh token malformé');
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('🔍 Réponse refresh token:', response.data);

        // Supporter les deux formats de tokens
        const responseData = response.data.data;
        const newToken = responseData.access_token || responseData.accessToken;
        const newRefreshToken =
          responseData.refresh_token || responseData.refreshToken;

        if (!newToken || !isValidJWTFormat(newToken)) {
          throw new Error('Nouveau token invalide reçu du serveur');
        }

        localStorage.setItem('token', newToken);
        if (newRefreshToken && isValidJWTFormat(newRefreshToken)) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Erreur lors du refresh token:', refreshError);
        // Rediriger vers la page de connexion
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API d'authentification
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) =>
    api.put('/auth/change-password', passwordData),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  refreshToken: (refreshToken) =>
    api.post('/auth/refresh-token', { refreshToken }),
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },
};

// API des utilisateurs
export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  getRoles: () => api.get('/users/roles'),
  getPlayerTypes: () => api.get('/users/player-types'),
  getTeamStats: () => api.get('/users/stats/team'),
  resendVerification: (id) => api.post(`/users/${id}/resend-verification`),
};

// API des événements
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  respond: (id, status) => api.patch(`/events/${id}/respond`, { status }),
  invite: (id, userIds) =>
    api.post(`/events/${id}/invite`, { user_ids: userIds }),
  markAttendance: (id, attendance) =>
    api.patch(`/events/${id}/attendance`, { attendance }),
  getTypes: () => api.get('/events/types'),
};

// API des demandes d'entraînement
export const practicesAPI = {
  create: (practiceData) => api.post('/practices/request', practiceData),
  getAll: (params) => api.get('/practices', { params }),
  getById: (id) => api.get(`/practices/${id}`),
  handle: (id, status, message) =>
    api.patch(`/practices/${id}/handle`, { status, response_message: message }),
  delete: (id) => api.delete(`/practices/${id}`),
  getStats: () => api.get('/practices/stats/overview'),
};

// API des nominations
export const nominationsAPI = {
  create: (nominationData) => api.post('/nominations', nominationData),
  getPending: () => api.get('/nominations/pending'),
  getHistory: () => api.get('/nominations/history'),
  approve: (id, approved, comment) =>
    api.post(`/nominations/${id}/approve`, { approved, comment }),
  delete: (id) => api.delete(`/nominations/${id}`),
};

// API des notes de session
export const sessionNotesAPI = {
  getBySession: (eventId) => api.get(`/session-notes/session/${eventId}`),
  create: (noteData) => api.post('/session-notes', noteData),
  update: (id, noteData) => api.put(`/session-notes/${id}`, noteData),
  delete: (id) => api.delete(`/session-notes/${id}`),
  getMyHomework: () => api.get('/session-notes/homework/my'),
  completeHomework: (id) => api.patch(`/session-notes/${id}/complete`),
  getUserHomework: (userId) => api.get(`/session-notes/homework/${userId}`),
  getStats: () => api.get('/session-notes/stats'),
};

// API des notifications (basées sur les événements)
export const notificationsAPI = {
  getAll: (params = {}) => api.get('/notifications', { params }),
  getCount: () => api.get('/notifications/count'),
  createInvitation: (invitationData) =>
    api.post('/notifications/invitations', invitationData),
  respondToInvitation: (responseData) =>
    api.post('/notifications/respond', responseData),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (preferences) =>
    api.put('/notifications/preferences', preferences),
  getStats: (params = {}) => api.get('/notifications/stats', { params }),
};

// API des analytics
export const analyticsAPI = {
  getGeneral: () => api.get('/analytics/general'),
  getUsers: () => api.get('/analytics/users'),
  getEvents: () => api.get('/analytics/events'),
  getPerformance: () => api.get('/analytics/performance'),
};

// API des rapports
export const reportingAPI = {
  getAttendance: (params) => api.post('/reporting/attendance', params),
};

// API des équipes adverses (opponent teams)
export const teamsAPI = {
  getOpponents: () => api.get('/opponent-teams'),
  // Ajoute d'autres méthodes si besoin
};

// ========================================
// AJOUT dans api.js côté client
// ========================================

// API des maps
export const mapsAPI = {
  getAll: (params = {}) => api.get('/maps', { params }), // ✅ Ajout du support des paramètres
  create: (mapData) => api.post('/maps', mapData),
  update: (id, mapData) => api.put(`/maps/${id}`, mapData),
  deactivate: (id) => api.delete(`/maps/${id}`),
};
export default api;

import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import { cleanupCorruptedTokens, isValidJWTFormat } from '../utils/token';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérifier le token au chargement
  useEffect(() => {
    // Nettoyer les tokens corrompus au démarrage
    const tokensWereCleaned = cleanupCorruptedTokens();
    if (tokensWereCleaned) {
      console.log('🧹 Tokens corrompus nettoyés');
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    const token = localStorage.getItem('token');

    if (token && isValidJWTFormat(token)) {
      authAPI.setAuthToken(token);
      // Vérifier si le token est valide
      authAPI
        .getProfile()
        .then((response) => {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: response.data.data },
          });
        })
        .catch((error) => {
          console.error('Token invalide au démarrage:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          dispatch({ type: 'LOGOUT' });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.login(credentials);

      console.log('🔍 Réponse complète du serveur:', response.data);

      const { user, tokens } = response.data.data;

      // Vérifier que les tokens existent (supporter les deux formats)
      const accessToken = tokens.access_token || tokens.accessToken;
      const refreshToken = tokens.refresh_token || tokens.refreshToken;

      if (!accessToken || !refreshToken) {
        console.error('❌ Tokens manquants. Tokens reçus:', tokens);
        throw new Error('Tokens manquants dans la réponse du serveur');
      }

      if (!isValidJWTFormat(accessToken)) {
        console.error("❌ Token d'accès invalide:", accessToken);
        throw new Error("Token d'accès invalide reçu du serveur");
      }

      if (!isValidJWTFormat(refreshToken)) {
        console.error('❌ Refresh token invalide:', refreshToken);
        throw new Error('Refresh token invalide reçu du serveur');
      }

      console.log('✅ Tokens valides reçus lors de la connexion');

      // Stocker les tokens
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Configurer le token pour les futures requêtes
      authAPI.setAuthToken(accessToken);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user },
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Erreur de connexion';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.register(userData);
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Erreur lors de l'inscription";
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    authAPI.setAuthToken(null);
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.data,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la mise à jour',
      };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

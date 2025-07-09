// Utilitaires pour la gestion des tokens JWT
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Vérifie si un token JWT est valide (structure de base)
 * @param {string} token - Le token JWT à vérifier
 * @returns {boolean} - True si le token semble valide
 */
export const isValidJWTFormat = (token) => {
  if (!token || typeof token !== 'string') return false;

  // Un JWT valide doit avoir 3 parties séparées par des points
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  // Vérifier que chaque partie n'est pas vide
  return parts.every((part) => part && part.length > 0);
};

/**
 * Décode le payload d'un token JWT (sans vérification de signature)
 * @param {string} token - Le token JWT à décoder
 * @returns {object|null} - Le payload décodé ou null si erreur
 */
export const decodeJWTPayload = (token) => {
  try {
    if (!isValidJWTFormat(token)) return null;

    const parts = token.split('.');
    const payload = parts[1];

    // Décoder le Base64URL
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Erreur lors du décodage du JWT:', error);
    return null;
  }
};

/**
 * Vérifie si un token JWT est expiré
 * @param {string} token - Le token JWT à vérifier
 * @returns {boolean} - True si le token est expiré
 */
export const isTokenExpired = (token) => {
  const payload = decodeJWTPayload(token);
  if (!payload || !payload.exp) return true;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Nettoie les tokens corrompus du localStorage
 * @returns {boolean} - True si des tokens ont été nettoyés
 */
export const cleanupCorruptedTokens = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  let cleaned = false;

  if (
    token &&
    (!isValidJWTFormat(token) || token === 'undefined' || token === 'null')
  ) {
    console.warn("Token d'accès corrompu détecté, suppression...");
    localStorage.removeItem('token');
    cleaned = true;
  }

  if (
    refreshToken &&
    (!isValidJWTFormat(refreshToken) ||
      refreshToken === 'undefined' ||
      refreshToken === 'null')
  ) {
    console.warn('Refresh token corrompu détecté, suppression...');
    localStorage.removeItem('refreshToken');
    cleaned = true;
  }

  return cleaned;
};

/**
 * Affiche des informations de debug sur les tokens
 */
export const debugTokens = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  console.group('🔍 Debug Tokens');

  console.log("Token d'accès:", {
    présent: !!token,
    valide: token ? isValidJWTFormat(token) : false,
    expiré: token ? isTokenExpired(token) : 'N/A',
    payload: token ? decodeJWTPayload(token) : null,
  });

  console.log('Refresh token:', {
    présent: !!refreshToken,
    valide: refreshToken ? isValidJWTFormat(refreshToken) : false,
    expiré: refreshToken ? isTokenExpired(refreshToken) : 'N/A',
    payload: refreshToken ? decodeJWTPayload(refreshToken) : null,
  });

  console.groupEnd();
};

/**
 * Récupère les tokens du localStorage de manière sécurisée
 * @returns {object} - Les tokens ou null si corrompus
 */
export const getTokensSecurely = () => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');

  // Vérifier la validité des tokens
  if (token && !isValidJWTFormat(token)) {
    console.error("Token d'accès malformé détecté");
    localStorage.removeItem('token');
    return { token: null, refreshToken: null };
  }

  if (refreshToken && !isValidJWTFormat(refreshToken)) {
    console.error('Refresh token malformé détecté');
    localStorage.removeItem('refreshToken');
    return { token: null, refreshToken: null };
  }

  return { token, refreshToken };
};

/**
 * Debug les réponses de l'API pour les tokens
 * @param {object} response - La réponse de l'API
 * @param {string} endpoint - L'endpoint appelé
 */
export const debugAPIResponse = (response, endpoint = 'API') => {
  console.group(`🔍 Debug ${endpoint} Response`);

  console.log('Status:', response.status);
  console.log('Headers:', response.headers);
  console.log('Data structure:', {
    success: response.data?.success,
    message: response.data?.message,
    hasData: !!response.data?.data,
    dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
  });

  if (response.data?.data?.tokens) {
    console.log('Tokens dans la réponse:', {
      accessToken: response.data.data.tokens.accessToken
        ? 'Présent'
        : 'Manquant',
      refreshToken: response.data.data.tokens.refreshToken
        ? 'Présent'
        : 'Manquant',
      access_token: response.data.data.tokens.access_token
        ? 'Présent'
        : 'Manquant',
      refresh_token: response.data.data.tokens.refresh_token
        ? 'Présent'
        : 'Manquant',
      tokenKeys: Object.keys(response.data.data.tokens),
    });
  }

  console.groupEnd();
};

/**
 * Extrait les tokens d'une réponse API en supportant les deux formats
 * @param {object} response - La réponse de l'API
 * @returns {object} - Les tokens extraits
 */
export const extractTokensFromResponse = (response) => {
  const tokens = response.data?.data?.tokens;
  if (!tokens) {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: tokens.access_token || tokens.accessToken,
    refreshToken: tokens.refresh_token || tokens.refreshToken,
  };
};

/**
 * Fonction de test pour déboguer la connexion
 * @param {string} email - Email de test
 * @param {string} password - Mot de passe de test
 */
export const testLogin = async (
  email = 'joueur@test.com',
  password = 'password'
) => {
  try {
    console.group('🧪 Test de connexion');
    console.log(`Tentative de connexion avec: ${email}`);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    console.log('Status HTTP:', response.status);
    console.log('Réponse complète:', data);

    if (data.success && data.data?.tokens) {
      console.log('✅ Connexion réussie !');
      debugAPIResponse({ data, status: response.status }, 'Login Test');

      const { accessToken, refreshToken } = extractTokensFromResponse({ data });
      console.log('Tokens extraits:', {
        accessToken: accessToken ? 'Présent et valide' : 'Manquant',
        refreshToken: refreshToken ? 'Présent et valide' : 'Manquant',
      });

      // Tester la validité des tokens
      if (accessToken && isValidJWTFormat(accessToken)) {
        console.log('✅ Access token valide');
        const payload = decodeJWTPayload(accessToken);
        console.log('Payload du token:', payload);
      }

      if (refreshToken && isValidJWTFormat(refreshToken)) {
        console.log('✅ Refresh token valide');
      }
    } else {
      console.log('❌ Échec de connexion:', data.message || 'Raison inconnue');
    }

    console.groupEnd();
    return data;
  } catch (error) {
    console.error('❌ Erreur lors du test de connexion:', error);
    console.groupEnd();
    return null;
  }
};

// Exposer la fonction globalement pour les tests en développement
if (typeof window !== 'undefined') {
  window.testLogin = testLogin;
}

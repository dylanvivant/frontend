import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Formatage des dates
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: fr });
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy à HH:mm');
};

export const formatTime = (date) => {
  return formatDate(date, 'HH:mm');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
};

// Utilitaires pour les classes CSS
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Validation des données
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  );
};

// Gestion des erreurs
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Une erreur est survenue';
};

// Utilitaires pour les rôles
export const getRoleDisplayName = (role) => {
  const roleMap = {
    Joueur: 'Joueur',
    Capitaine: 'Capitaine',
    Coach: 'Coach',
    Admin: 'Administrateur',
  };
  return roleMap[role] || role;
};

export const getRoleColor = (role) => {
  const colorMap = {
    Joueur: 'bg-gray-100 text-gray-800',
    Capitaine: 'bg-primary-100 text-primary-800',
    Coach: 'bg-secondary-100 text-secondary-800',
    Admin: 'bg-red-100 text-red-800',
  };
  return colorMap[role] || 'bg-gray-100 text-gray-800';
};

// Utilitaires pour les statuts
export const getStatusColor = (status) => {
  const colorMap = {
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    tentative: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusDisplayName = (status) => {
  const statusMap = {
    accepted: 'Accepté',
    declined: 'Refusé',
    tentative: 'Incertain',
    pending: 'En attente',
    completed: 'Terminé',
    cancelled: 'Annulé',
  };
  return statusMap[status] || status;
};

// Utilitaires pour les rangs Valorant
export const getRankColor = (rank) => {
  const colorMap = {
    Iron: 'bg-gray-600 text-white',
    Bronze: 'bg-amber-600 text-white',
    Silver: 'bg-gray-400 text-white',
    Gold: 'bg-yellow-500 text-white',
    Platinum: 'bg-cyan-500 text-white',
    Diamond: 'bg-purple-500 text-white',
    Immortal: 'bg-red-500 text-white',
    Radiant: 'bg-pink-500 text-white',
  };
  return colorMap[rank] || 'bg-gray-100 text-gray-800';
};

// Utilitaires pour les notifications
export const getNotificationIcon = (type) => {
  const iconMap = {
    event: '📅',
    practice: '🏃',
    nomination: '🏆',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
  };
  return iconMap[type] || 'ℹ️';
};

// Utilitaires pour la pagination
export const calculatePagination = (currentPage, totalPages, delta = 2) => {
  const range = [];
  const rangeWithDots = [];

  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    rangeWithDots.push(1, '...');
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push('...', totalPages);
  } else {
    rangeWithDots.push(totalPages);
  }

  return rangeWithDots;
};

// Utilitaires pour le stockage local
export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
    }
  },
};

// Utilitaires pour les URLs
export const generateAvatar = (name) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return colors[colorIndex];
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Fonction pour convertir une date UTC en heure locale pour l'affichage
export const formatDateTimeForDisplay = (utcDateString) => {
  if (!utcDateString) return null;

  // Créer une date à partir de la chaîne UTC
  const date = new Date(utcDateString);

  // Retourner la date en heure locale
  return date;
};

// Fonction pour formater une date UTC en string locale pour les inputs datetime-local
export const formatDateTimeForInput = (utcDateString) => {
  if (!utcDateString) return '';

  // Extraire directement la date et l'heure de la chaîne UTC
  const dateMatch = utcDateString.match(/(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  if (dateMatch) {
    return `${dateMatch[1]}T${dateMatch[2]}`;
  }

  // Fallback si le format n'est pas reconnu
  const date = new Date(utcDateString);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

// Fonction simple pour formater une datetime-local pour la base de données
export const formatDateTimeForDatabase = (localDateTimeString) => {
  if (!localDateTimeString) return null;

  // Prendre directement la valeur de l'input et ajouter les secondes + timezone
  // "2025-07-13T18:00" -> "2025-07-13T18:00:00.000Z"
  return localDateTimeString + ':00.000Z';
};

// Fonction pour traiter les dates comme des heures locales (pas UTC)
export const parseAsLocalTime = (dateString) => {
  if (!dateString) return null;

  // Si la date contient un fuseau horaire, on la parse normalement
  if (
    dateString.includes('T') &&
    (dateString.includes('Z') || dateString.includes('+'))
  ) {
    return new Date(dateString);
  }

  // Sinon, on la traite comme une heure locale
  const date = new Date(dateString);

  // Compenser le décalage de fuseau horaire pour traiter comme heure locale
  const offsetInMinutes = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() + offsetInMinutes * 60000);

  return localDate;
};

// Fonction pour afficher une heure en format local, en traitant la date comme heure locale
export const formatTimeAsLocal = (dateString) => {
  if (!dateString) return '--:--';

  // Extraire l'heure directement de la chaîne UTC sans conversion
  const dateMatch = dateString.match(/(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  if (dateMatch) {
    return dateMatch[2]; // Retourner directement l'heure HH:MM
  }

  // Fallback si le format n'est pas reconnu
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });
};

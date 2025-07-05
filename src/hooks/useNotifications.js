import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Hook pour récupérer les notifications
export const useNotifications = (params = {}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', user?.id, params],
    queryFn: () => notificationsAPI.getAll(params),
    enabled: !!user,
    staleTime: 30000, // 30 secondes
    refetchInterval: 60000, // Rafraîchir toutes les minutes
  });
};

// Hook pour récupérer le nombre de notifications non lues
export const useNotificationsCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', 'count', user?.id],
    queryFn: () => notificationsAPI.getCount(),
    enabled: !!user,
    staleTime: 10000, // 10 secondes
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
};

// Hook pour marquer une notification comme lue
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (notificationId) => notificationsAPI.markAsRead(notificationId),
    onSuccess: () => {
      // Invalider les caches des notifications
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'count', user?.id],
      });
    },
  });
};

// Hook pour marquer toutes les notifications comme lues
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      // Invalider les caches des notifications
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'count', user?.id],
      });
    },
  });
};

// Hook pour supprimer une notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (notificationId) => notificationsAPI.delete(notificationId),
    onSuccess: () => {
      // Invalider les caches des notifications
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'count', user?.id],
      });
    },
  });
};

// Hook pour créer une invitation d'événement
export const useCreateInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationData) =>
      notificationsAPI.createInvitation(invitationData),
    onSuccess: () => {
      // Invalider les caches des notifications pour tous les utilisateurs invités
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Hook pour répondre à une invitation
export const useRespondToInvitation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (responseData) =>
      notificationsAPI.respondToInvitation(responseData),
    onSuccess: () => {
      // Invalider les caches des notifications et des événements
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'count', user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Hook pour récupérer les préférences de notification
export const useNotificationPreferences = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', 'preferences', user?.id],
    queryFn: () => notificationsAPI.getPreferences(),
    enabled: !!user,
    staleTime: 300000, // 5 minutes
  });
};

// Hook pour mettre à jour les préférences de notification
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (preferences) =>
      notificationsAPI.updatePreferences(preferences),
    onSuccess: () => {
      // Invalider le cache des préférences
      queryClient.invalidateQueries({
        queryKey: ['notifications', 'preferences', user?.id],
      });
    },
  });
};

// Hook pour récupérer les statistiques de notification
export const useNotificationStats = (params = {}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', 'stats', user?.id, params],
    queryFn: () => notificationsAPI.getStats(params),
    enabled: !!user,
    staleTime: 60000, // 1 minute
  });
};

// Hook utilitaire pour gérer les notifications en temps réel
export const useNotificationUpdates = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fonction pour rafraîchir les notifications
  const refreshNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    queryClient.invalidateQueries({
      queryKey: ['notifications', 'count', user?.id],
    });
  };

  // Fonction pour marquer une notification comme vue localement
  const markAsReadLocally = (notificationId) => {
    queryClient.setQueryData(['notifications', user?.id], (oldData) => {
      if (!oldData?.data?.notifications) return oldData;

      return {
        ...oldData,
        data: {
          ...oldData.data,
          notifications: oldData.data.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          ),
          unread_count: Math.max(0, oldData.data.unread_count - 1),
        },
      };
    });
  };

  return {
    refreshNotifications,
    markAsReadLocally,
  };
};

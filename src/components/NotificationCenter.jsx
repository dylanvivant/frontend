import { useState } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  Users,
  AlertCircle,
} from 'lucide-react';
import {
  useNotifications,
  useNotificationsCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useRespondToInvitation,
} from '../hooks/useNotifications';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Loading } from './ui/Loading';

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const {
    data: notifications,
    isLoading,
    error,
  } = useNotifications({
    unread_only: showUnreadOnly,
  });
  const { data: countData } = useNotificationsCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();
  const respondToInvitationMutation = useRespondToInvitation();

  const unreadCount = countData?.data?.count || 0;
  const notificationsList = notifications?.data?.notifications || [];

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (notificationId) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleRespondToInvitation = (eventId, status) => {
    respondToInvitationMutation.mutate({ event_id: eventId, status });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'invitation':
        return <Users className="h-4 w-4 text-primary" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationStyle = (type, isRead) => {
    const baseStyle = `p-4 border-l-4 ${isRead ? 'bg-gray-50' : 'bg-white'}`;

    switch (type) {
      case 'invitation':
        return `${baseStyle} border-l-primary`;
      case 'event':
        return `${baseStyle} border-l-blue-500`;
      case 'success':
        return `${baseStyle} border-l-green-500`;
      case 'warning':
        return `${baseStyle} border-l-yellow-500`;
      default:
        return `${baseStyle} border-l-gray-300`;
    }
  };

  return (
    <div className="relative">
      {/* Bouton de notification */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Panneau de notifications */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* En-tête */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Contrôles */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant={showUnreadOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                >
                  {showUnreadOnly ? 'Toutes' : 'Non lues'}
                </Button>
                {unreadCount > 0 && (
                  <Badge variant="secondary">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Tout marquer
                </Button>
              )}
            </div>
          </div>

          {/* Liste des notifications */}
          <div className="overflow-y-auto max-h-80">
            {isLoading ? (
              <div className="p-4 text-center">
                <Loading />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                Erreur lors du chargement des notifications
              </div>
            ) : notificationsList.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {showUnreadOnly
                  ? 'Aucune notification non lue'
                  : 'Aucune notification'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notificationsList.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onRespondToInvitation={handleRespondToInvitation}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationStyle={getNotificationStyle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour chaque notification individuelle
const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
  onRespondToInvitation,
  getNotificationIcon,
  getNotificationStyle,
}) => {
  const [showActions, setShowActions] = useState(false);

  const isInvitation =
    notification.type === 'invitation' &&
    notification.metadata?.status === 'pending';
  const eventId = notification.metadata?.event_id || notification.event_id;

  // Debug des boutons
  console.log('🔍 Debug notification:', {
    id: notification.id,
    type: notification.type,
    metadataStatus: notification.metadata?.status,
    isInvitation,
    eventId,
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={getNotificationStyle(notification.type, notification.is_read)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start space-x-3">
        {getNotificationIcon(notification.type)}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4
                className={`text-sm font-medium ${
                  notification.is_read ? 'text-gray-600' : 'text-gray-900'
                }`}
              >
                {notification.title}
              </h4>
              <p
                className={`text-sm mt-1 ${
                  notification.is_read ? 'text-gray-500' : 'text-gray-700'
                }`}
              >
                {notification.content}
              </p>

              {/* Métadonnées */}
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-gray-500">
                  {formatDate(notification.created_at)}
                </span>
                {notification.metadata?.event_type && (
                  <Badge variant="outline" className="text-xs">
                    {notification.metadata.event_type}
                  </Badge>
                )}
                {notification.priority === 'high' && (
                  <Badge variant="destructive" className="text-xs">
                    Urgent
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-1 ml-2">
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500 hover:text-red-700"
                  onClick={() => onDelete(notification.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Actions pour les invitations */}
          {isInvitation && (
            <div className="flex items-center space-x-2 mt-3">
              <Button
                size="sm"
                variant="default"
                onClick={() => onRespondToInvitation(eventId, 'accepted')}
              >
                Accepter
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRespondToInvitation(eventId, 'declined')}
              >
                Refuser
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;

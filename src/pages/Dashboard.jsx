import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { eventsAPI, analyticsAPI, notificationsAPI } from '../services/api';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Loading from '../components/ui/Loading';
import {
  formatDate,
  formatTime,
  getStatusColor,
  getStatusDisplayName,
} from '../utils/helpers';
import { debugTokens } from '../utils/token';
import {
  CalendarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();

  // Récupération des événements à venir
  const { data: upcomingEvents, isLoading: eventsLoading } = useQuery(
    'upcomingEvents',
    () => eventsAPI.getAll({ limit: 5, status: 'upcoming' }),
    {
      onError: (error) =>
        console.error('Erreur lors de la récupération des événements:', error),
    }
  );

  // Récupération des statistiques générales (pour les capitaines/admins)
  const { data: stats, isLoading: statsLoading } = useQuery(
    'generalStats',
    () => analyticsAPI.getGeneral(),
    {
      enabled: ['Capitaine', 'Coach', 'Admin'].includes(user?.role),
      onError: (error) =>
        console.error(
          'Erreur lors de la récupération des statistiques:',
          error
        ),
    }
  );

  // Récupération des notifications récentes - CORRECTION ICI
  const {
    data: notifications,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useQuery(
    'recentNotifications',
    () => notificationsAPI.getAll({ limit: 5 }),
    {
      select: (data) => {
        // Accès correct : data.data.notifications au lieu de data.data.data
        const notificationsArray = data?.data?.data?.notifications || [];

        // Vérification que c'est bien un tableau avant slice
        if (Array.isArray(notificationsArray)) {
          const sliced = notificationsArray.slice(0, 5);
          console.log('🔍 Notifications après slice:', sliced);
          return sliced;
        }

        console.warn(
          '⚠️ Les notifications ne sont pas un tableau:',
          notificationsArray
        );
        return [];
      },
      // Forcer le rechargement pour le debug
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bonne après-midi';
    return 'Bonsoir';
  };

  const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => (
    <Card className="p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </Card>
  );

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* En-tête de bienvenue */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getWelcomeMessage()}, {user?.pseudo}
              </h1>
              <p className="text-sm text-gray-600">
                Voici un aperçu de votre équipe aujourd&apos;hui
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques générales (pour les capitaines/admins) */}
        {['Capitaine', 'Coach', 'Admin'].includes(user?.role) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <Loading />
              </div>
            ) : (
              <>
                <StatCard
                  title="Membres de l'équipe"
                  value={stats?.data?.data?.total_users || 0}
                  icon={UserGroupIcon}
                />
                <StatCard
                  title="Événements"
                  value={stats?.data?.data?.total_events || 0}
                  icon={CalendarIcon}
                />
                <StatCard
                  title="Demandes en attente"
                  value={stats?.data?.data?.total_practices || 0}
                  icon={ClipboardDocumentListIcon}
                  color="secondary"
                />
                <StatCard
                  title="Membres actifs"
                  value={stats?.data?.data?.active_users || 0}
                  icon={UserGroupIcon}
                  color="green"
                />
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Événements à venir */}
          <div className="lg:col-span-2">
            <Card title="Événements à venir" className="h-full">
              {eventsLoading ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents?.data?.data?.events?.length > 0 ? (
                    upcomingEvents.data.data.events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <CalendarIcon className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {event.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(event.start_date)} à{' '}
                              {formatTime(event.start_date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {event.is_mandatory && (
                            <Badge variant="warning" size="sm">
                              Obligatoire
                            </Badge>
                          )}
                          <Badge variant="info" size="sm">
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Aucun événement
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Aucun événement à venir pour le moment.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Notifications récentes */}
          <div>
            <Card title="Notifications récentes" className="h-full">
              {notificationsLoading ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : notificationsError ? (
                <div className="text-center py-8">
                  <BellIcon className="mx-auto h-12 w-12 text-red-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Erreur de chargement
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {notificationsError.message}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications &&
                  Array.isArray(notifications) &&
                  notifications.length > 0 ? (
                    notifications.map((notification) => {
                      console.log('🎯 Rendu notification:', notification);
                      return (
                        <div key={notification.id} className="flex space-x-3">
                          <div className="flex-shrink-0">
                            <BellIcon className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {notification.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(notification.created_at)}
                            </p>
                            {/* Debug pour is_read */}
                            {process.env.NODE_ENV === 'development' && (
                              <p className="text-xs text-blue-600">
                                {notification.is_read ? 'Lu' : 'Non lu'}
                              </p>
                            )}
                          </div>
                          {!notification.is_read && (
                            <div className="flex-shrink-0">
                              <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Aucune notification
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Vous n&apos;avez pas de nouvelles notifications.
                      </p>
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="mt-2 text-xs text-gray-400">
                          Debug: notifications ={' '}
                          {notifications ? 'existe' : 'null'}, isArray ={' '}
                          {Array.isArray(notifications) ? 'true' : 'false'},
                          length = {notifications?.length || 'undefined'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Raccourcis rapides */}
        <div className="mt-8">
          <Card title="Raccourcis rapides">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/events"
                className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <CalendarIcon className="h-6 w-6 text-primary-600 mr-3" />
                <span className="text-sm font-medium text-primary-900">
                  Voir les événements
                </span>
              </a>
              <a
                href="/team"
                className="flex items-center p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                <UserGroupIcon className="h-6 w-6 text-secondary-600 mr-3" />
                <span className="text-sm font-medium text-secondary-900">
                  Équipe
                </span>
              </a>
              <a
                href="/notifications"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <BellIcon className="h-6 w-6 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-blue-900">
                  Notifications
                </span>
              </a>
              <a
                href="/profile"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <UserGroupIcon className="h-6 w-6 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-900">
                  Mon profil
                </span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

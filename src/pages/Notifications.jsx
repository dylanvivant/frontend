import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { notificationsAPI } from '../services/api';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();
  const notifRefs = useRef({});

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const notifId = params.get('id');
    if (notifId && notifRefs.current[notifId]) {
      notifRefs.current[notifId].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      notifRefs.current[notifId].classList.add('ring-2', 'ring-blue-400');
      setTimeout(() => {
        notifRefs.current[notifId]?.classList.remove('ring-2', 'ring-blue-400');
      }, 2000);
    }
  }, [notifications, location.search]);

  async function fetchNotifications() {
    setIsLoading(true);
    setError('');
    try {
      const res = await notificationsAPI.getAll();
      const notifications = res.data?.data?.notifications || [];
      console.log('📋 Notifications reçues:', notifications);
      setNotifications(notifications);
    } catch (e) {
      setError('Erreur lors du chargement des notifications');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRespond(eventId, status) {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      console.log(
        '🔄 Réponse à invitation - eventId:',
        eventId,
        'status:',
        status
      );
      await notificationsAPI.respondToInvitation({
        event_id: eventId,
        status,
      });
      setSuccess('Réponse envoyée !');
      fetchNotifications();
    } catch (e) {
      console.error('❌ Erreur lors de la réponse:', e);
      setError('Erreur lors de la réponse');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className="w-full bg-gray-50 min-h-screen p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h1>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {isLoading ? (
            <div>Chargement...</div>
          ) : notifications.length === 0 ? (
            <div className="text-gray-500">Aucune notification</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  ref={(el) => (notifRefs.current[notif.id] = el)}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {notif.title}
                    </div>
                    <div className="text-gray-600 text-sm">{notif.content}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {notif.date &&
                        new Date(notif.date).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  {notif.type === 'invitation' &&
                    notif.metadata?.status === 'pending' && (
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          onClick={() =>
                            handleRespond(notif.event_id, 'accepted')
                          }
                          disabled={isLoading}
                        >
                          Accepter
                        </button>
                        <button
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                          onClick={() =>
                            handleRespond(notif.event_id, 'declined')
                          }
                          disabled={isLoading}
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                  {notif.type === 'invitation' &&
                    notif.metadata?.status !== 'pending' && (
                      <div className="text-xs font-medium text-gray-500 mt-2 sm:mt-0">
                        {notif.metadata?.status === 'accepted' && (
                          <span className="text-green-600">Acceptée</span>
                        )}
                        {notif.metadata?.status === 'declined' && (
                          <span className="text-red-600">Refusée</span>
                        )}
                        {notif.metadata?.status === 'expired' && (
                          <span className="text-gray-400">Expirée</span>
                        )}
                      </div>
                    )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Notifications;

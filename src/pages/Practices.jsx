import { useEffect, useState } from 'react';
import { practicesAPI } from '../services/api';
import Layout from '../components/layout/Layout';

const statusLabels = {
  all: 'Toutes',
  pending: 'En attente',
  accepted: 'Acceptée',
  declined: 'Refusée',
};

export default function Practices() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');
  const [response, setResponse] = useState({});

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, [filter]);

  async function fetchRequests() {
    setIsLoading(true);
    setError('');
    try {
      const res = await practicesAPI.getAll({ status: filter });
      setRequests(res.data?.data?.requests || []);
    } catch (e) {
      setError('Erreur lors du chargement des demandes');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAction(id, status) {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await practicesAPI.handle(id, status, response[id] || '');
      setSuccess(`Demande ${status === 'accepted' ? 'acceptée' : 'refusée'} !`);
      setResponse((r) => ({ ...r, [id]: '' }));
      fetchRequests();
    } catch (e) {
      setError('Erreur lors du traitement');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className="w-full bg-gray-50 min-h-screen p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Demandes de practice
          </h1>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              {['all', 'pending', 'accepted', 'declined'].map((s) => (
                <button
                  key={s}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    filter === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                  }`}
                  onClick={() => setFilter(s)}
                >
                  {statusLabels[s]}
                </button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              Affichage : {statusLabels[filter]} ({requests.length} demande
              {requests.length > 1 ? 's' : ''})
            </div>
          </div>
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {isLoading ? (
            <div>Chargement...</div>
          ) : requests.length === 0 ? (
            <div className="text-gray-500">Aucune demande</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Équipe
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Capitaine
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Rank
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Message
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Traité par
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {r.team_name}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {r.captain_pseudo}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      <div className="text-xs">
                        <div>{r.captain_email}</div>
                        {r.captain_discord && (
                          <div className="text-gray-500">
                            Discord: {r.captain_discord}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {r.team_average_rank || '-'}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      <div className="text-xs">
                        <div>
                          {r.requested_date
                            ? new Date(r.requested_date).toLocaleDateString(
                                'fr-FR'
                              )
                            : '-'}
                        </div>
                        {r.alternative_dates &&
                          r.alternative_dates.length > 0 && (
                            <div className="text-gray-500">
                              +{r.alternative_dates.length} date(s) alt.
                            </div>
                          )}
                      </div>
                    </td>
                    <td
                      className="px-4 py-2 text-gray-700 max-w-xs truncate"
                      title={r.message}
                    >
                      {r.message || '-'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                          r.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : r.status === 'accepted'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {statusLabels[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-xs text-gray-600">
                      {r.users?.pseudo || '-'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {r.status === 'pending' && (
                        <div className="flex flex-col gap-2 items-center">
                          <textarea
                            placeholder="Message de réponse (optionnel)"
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-xs"
                            value={response[r.id] || ''}
                            onChange={(e) =>
                              setResponse((resp) => ({
                                ...resp,
                                [r.id]: e.target.value,
                              }))
                            }
                          />
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                              onClick={() => handleAction(r.id, 'accepted')}
                              disabled={isLoading}
                            >
                              Accepter
                            </button>
                            <button
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                              onClick={() => handleAction(r.id, 'declined')}
                              disabled={isLoading}
                            >
                              Refuser
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}

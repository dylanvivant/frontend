import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Modal from '../components/ui/Modal';

const rankImages = {
  iron: '/iron.svg',
  bronze: '/bronze.svg',
  silver: '/silver.svg',
  gold: '/gold.svg',
  platinum: '/platinum.svg',
  diamond: '/diamond.svg',
  ascendant: '/ascendant.svg',
  immortal: '/immortal.svg',
  radiant: '/radiant.svg',
};

function Team() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    pseudo: '',
    email: '',
    role_id: '',
    rank: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setIsLoading(true);
    try {
      const res = await usersAPI.getAll();
      setMembers(res.data?.data?.members || []);
    } catch (e) {
      setError("Erreur lors du chargement de l'équipe");
    } finally {
      setIsLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await usersAPI.create(form);
      setSuccess('Joueur ajouté avec succès !');
      setShowAddModal(false);
      setForm({ pseudo: '', email: '', role_id: '', rank: '' });
      fetchMembers();
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendVerification(id) {
    setIsLoading(true);
    try {
      await usersAPI.resendVerification(id);
      setSuccess('Mail de vérification renvoyé !');
    } catch (e) {
      setError('Erreur lors de l’envoi du mail');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className="w-full bg-gray-50 min-h-screen p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion de l'équipe
          </h1>
          {user?.role === 'Capitaine' && (
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-sm"
              onClick={() => setShowAddModal(true)}
            >
              Ajouter un joueur
            </button>
          )}
        </div>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        {success && <div className="text-green-600 mb-4">{success}</div>}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Pseudo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Rôle
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Rank
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Vérification
                </th>
                {user?.role === 'Capitaine' && (
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {m.pseudo}
                  </td>
                  <td className="px-4 py-2 text-gray-700">
                    {m.roles?.name || '-'}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{m.email}</td>
                  <td className="px-4 py-2">
                    {m.rank ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={rankImages[m.rank.toLowerCase()]}
                          alt={m.rank}
                          className="w-6 h-6"
                        />
                        <span className="capitalize">{m.rank}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {m.is_verified ? (
                      <span className="inline-flex items-center text-green-600 font-bold">
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Vérifié
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-yellow-600 font-bold">
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01"
                          />
                        </svg>
                        Non vérifié
                      </span>
                    )}
                  </td>
                  {user?.role === 'Capitaine' && (
                    <td className="px-4 py-2 text-center">
                      {!m.is_verified && (
                        <button
                          className="text-blue-600 hover:underline"
                          onClick={() => handleResendVerification(m.id)}
                          disabled={isLoading}
                        >
                          Renvoyer mail
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal d'ajout de joueur */}
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAdd} className="p-4">
            <h2 className="text-xl font-bold mb-4">Ajouter un joueur</h2>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Pseudo *</label>
              <input
                name="pseudo"
                value={form.pseudo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Rôle *</label>
              <select
                name="role_id"
                value={form.role_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Sélectionner un rôle</option>
                <option value="1">Joueur</option>
                <option value="2">Coach</option>
                <option value="3">Capitaine</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Rank Valorant
              </label>
              <select
                name="rank"
                value={form.rank}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Sélectionner un rank</option>
                <option value="iron">Iron</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
                <option value="diamond">Diamond</option>
                <option value="ascendant">Ascendant</option>
                <option value="immortal">Immortal</option>
                <option value="radiant">Radiant</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}

export default Team;

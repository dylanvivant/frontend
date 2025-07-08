import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, authAPI } from '../services/api';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';

const ranks = [
  'Iron',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Ascendant',
  'Immortal',
  'Radiant',
];

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    pseudo: user?.pseudo || '',
    email: user?.email || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setIsLoading(true);
    setSuccess('');
    setError('');
    try {
      await usersAPI.update(user.id, form);
      setSuccess('Profil mis à jour !');
      setIsEditing(false);
      window.location.reload(); // <-- recharge la page pour tout rafraîchir
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsLoading(false);
    }
  }

  function handlePwChange(e) {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');
    if (passwords.new !== passwords.confirm) {
      setPwError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    try {
      await authAPI.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });
      setPwSuccess('Mot de passe changé avec succès !');
      setPasswords({ current: '', new: '', confirm: '' });
      setShowPassword(false);
    } catch (e) {
      setPwError(
        e.response?.data?.message ||
          'Erreur lors du changement de mot de passe.'
      );
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Mon profil</h1>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={`/public/${user?.rank?.toLowerCase() || 'iron'}.svg`}
                alt={user?.rank || 'Iron'}
                className="w-16 h-16 rounded-full border bg-gray-50 object-contain"
                onError={(e) => (e.target.style.display = 'none')}
              />
              <div>
                <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  {user?.pseudo}
                  <Badge>{user?.role}</Badge>
                </div>
                <div className="text-gray-500 text-sm">{user?.email}</div>
                {user?.rank && (
                  <div className="mt-1 text-xs text-indigo-600 font-medium">
                    {user.rank}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Pseudo</label>
                <input
                  name="pseudo"
                  value={form.pseudo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Rank</label>
                <select
                  name="rank"
                  value={form.rank || user?.rank || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  disabled={!isEditing}
                >
                  <option value="">Sélectionner un rang</option>
                  {ranks.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {success && <div className="text-green-600">{success}</div>}
            {/* {error && <div className="text-red-600">{error}</div>} */}
            <div className="flex gap-2 mt-2">
              {!isEditing ? (
                <button
                  type="button"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                  onClick={() => setIsEditing(true)}
                >
                  Modifier
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                    disabled={isLoading}
                  >
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                    onClick={() => {
                      setIsEditing(false);
                      setForm({ pseudo: user.pseudo, email: user.email });
                    }}
                  >
                    Annuler
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Changement de mot de passe */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Changer le mot de passe
            </h2>
            <button
              className="text-primary-600 hover:underline text-sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Fermer' : 'Modifier'}
            </button>
          </div>
          {showPassword && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mot de passe actuel
                </label>
                <input
                  name="current"
                  type="password"
                  value={passwords.current}
                  onChange={handlePwChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  name="new"
                  type="password"
                  value={passwords.new}
                  onChange={handlePwChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  name="confirm"
                  type="password"
                  value={passwords.confirm}
                  onChange={handlePwChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              {pwSuccess && <div className="text-green-600">{pwSuccess}</div>}
              {pwError && <div className="text-red-600">{pwError}</div>}
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                Changer le mot de passe
              </button>
            </form>
          )}
        </div>

        {/* Discord & liens */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <a
            href="https://discord.gg/vE2aqfJT4H"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700 transition mb-2"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.07.07 0 00-.073.035c-.211.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.385-.405-.874-.617-1.249a.07.07 0 00-.073-.035c-1.67.285-3.29.822-4.885 1.515a.064.064 0 00-.03.027C.533 9.045-.32 13.579.099 18.057a.07.07 0 00.028.048c2.052 1.507 4.042 2.422 5.992 3.029a.07.07 0 00.076-.027c.461-.63.873-1.295 1.226-1.994a.07.07 0 00-.038-.098c-.652-.247-1.27-.549-1.872-.892a.07.07 0 01-.007-.117c.126-.094.252-.192.371-.291a.07.07 0 01.073-.01c3.927 1.793 8.18 1.793 12.061 0a.07.07 0 01.074.009c.12.099.245.197.372.291a.07.07 0 01-.006.117 12.298 12.298 0 01-1.873.893.07.07 0 00-.037.097c.36.699.772 1.364 1.226 1.994a.07.07 0 00.076.028c1.95-.607 3.94-1.522 5.992-3.029a.07.07 0 00.028-.048c.5-5.177-.838-9.673-3.548-13.661a.061.061 0 00-.03-.027z" />
            </svg>
            Rejoindre le Discord
          </a>
          <div className="text-gray-500 text-sm mt-2">
            Besoin d'aide ? Consultez la{' '}
            <a href="/glossary" className="text-indigo-600 hover:underline">
              FAQ/Glossaire
            </a>{' '}
            ou contactez un admin.
          </div>
        </div>
      </div>
    </Layout>
  );
}

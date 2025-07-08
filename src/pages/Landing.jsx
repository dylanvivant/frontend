import { useState } from 'react';
import { practicesAPI } from '../services/api';
import { Link } from 'react-router-dom';

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

export default function Landing() {
  const [form, setForm] = useState({
    team_name: '',
    captain_email: '',
    captain_discord: '',
    captain_pseudo: '',
    team_average_rank: '',
    requested_date: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setSuccess('');
    setError('');
    try {
      await practicesAPI.create(form);
      setSuccess('Votre demande de practice a bien été envoyée !');
      setForm({
        team_name: '',
        captain_email: '',
        captain_discord: '',
        captain_pseudo: '',
        team_average_rank: '',
        requested_date: '',
        message: '',
      });
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la soumission.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-primary-700 mb-2">
          Silent For Vibes
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Plateforme de gestion d'équipe esport et organisation de practices.
          <br />
          Remplissez le formulaire pour proposer un entraînement à notre équipe
          !
        </p>
        {success && (
          <div className="text-green-600 mb-4 text-center">{success}</div>
        )}
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nom de l'équipe *
            </label>
            <input
              name="team_name"
              value={form.team_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email du capitaine *
            </label>
            <input
              name="captain_email"
              type="email"
              value={form.captain_email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Discord du capitaine
            </label>
            <input
              name="captain_discord"
              value={form.captain_discord}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Pseudo du capitaine *
            </label>
            <input
              name="captain_pseudo"
              value={form.captain_pseudo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Niveau moyen de l'équipe
            </label>
            <select
              name="team_average_rank"
              value={form.team_average_rank}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Sélectionner un rank</option>
              {ranks.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Date souhaitée *
            </label>
            <input
              name="requested_date"
              type="date"
              value={form.requested_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Message (optionnel)
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition"
            disabled={isLoading}
          >
            {isLoading ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </form>
        <div className="text-center text-gray-600 mt-4">
          <p>
            Vous avez êtes un joueur de Silent For Vibes ?{' '}
            <Link to="/login" className="text-primary-600">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

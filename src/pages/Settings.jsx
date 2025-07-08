import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    inApp: true,
    marketing: false,
  });
  const [theme, setTheme] = useState('system');
  const [success, setSuccess] = useState('');

  function handleNotifChange(e) {
    setNotifPrefs({ ...notifPrefs, [e.target.name]: e.target.checked });
  }

  function handleThemeChange(e) {
    setTheme(e.target.value);
  }

  function handleSave(e) {
    e.preventDefault();
    setSuccess('Préférences enregistrées !');
    setTimeout(() => setSuccess(''), 2000);
    // TODO: Appeler l'API pour sauvegarder les préférences
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Paramètres</h1>
        <form
          onSubmit={handleSave}
          className="bg-white rounded-xl shadow p-6 space-y-8"
        >
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Notifications
            </h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="email"
                  checked={notifPrefs.email}
                  onChange={handleNotifChange}
                  className="accent-indigo-600"
                />
                Recevoir les notifications par email
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="inApp"
                  checked={notifPrefs.inApp}
                  onChange={handleNotifChange}
                  className="accent-indigo-600"
                />
                Notifications dans l'application
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="marketing"
                  checked={notifPrefs.marketing}
                  onChange={handleNotifChange}
                  className="accent-indigo-600"
                />
                Recevoir les actualités et offres spéciales
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Apparence
            </h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={theme === 'system'}
                  onChange={handleThemeChange}
                  className="accent-indigo-600"
                />
                Système
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={handleThemeChange}
                  className="accent-indigo-600"
                />
                Clair
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={handleThemeChange}
                  className="accent-indigo-600"
                />
                Sombre
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Liens rapides
            </h2>
            <div className="flex flex-wrap gap-3">
              <a
                href="/profile"
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition"
              >
                Mon profil
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo(0, 0);
                  document.querySelector('button:text("Modifier")')?.click();
                }}
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition"
              >
                Changer le mot de passe
              </a>
              <a
                href="/glossary"
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100 transition"
              >
                Glossaire
              </a>
              <a
                href="https://discord.gg/vE2aqfJT4H"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition"
              >
                Discord
              </a>
            </div>
          </div>

          {success && (
            <div className="text-green-600 font-medium">{success}</div>
          )}
          <button
            type="submit"
            className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </Layout>
  );
}

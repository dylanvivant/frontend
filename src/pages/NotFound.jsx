import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icône d'erreur */}
        <div className="mb-8">
          <svg
            className="mx-auto h-32 w-32 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          4<span className="text-primary-600">0</span>4
        </h1>

        {/* Sous-titre */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page non trouvée
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Oops ! La page que vous recherchez n&apos;existe pas ou a été
          déplacée. Retournez à l&apos;accueil pour continuer votre navigation.
        </p>

        {/* Boutons d'action */}
        <div className="space-y-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 inline-block"
              >
                🏠 Tableau de bord
              </Link>
              <Link
                to="/events"
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 inline-block"
              >
                📅 Événements
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/"
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 inline-block"
              >
                🏠 Accueil
              </Link>
              <Link
                to="/login"
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 inline-block"
              >
                🔑 Connexion
              </Link>
            </>
          )}
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Si vous pensez qu&apos;il s&apos;agit d&apos;une erreur, contactez
            notre équipe technique.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

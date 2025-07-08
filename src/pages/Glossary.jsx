import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import {
  BookOpenIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

export default function Glossary() {
  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpenIcon className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Glossaire Esport
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Découvrez les termes et concepts essentiels du monde esport
          </p>
        </div>

        <Card className="mb-8">
          <div className="flex items-start space-x-4 p-6">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Page en cours de développement
              </h3>
              <p className="text-gray-600 mb-4">
                Cette page est actuellement en construction. Nous travaillons
                sur un glossaire complet des termes esport, des stratégies de
                jeu, et des concepts d'équipe.
              </p>
              <div className="bg-primary-50 rounded-lg p-4">
                <h4 className="font-medium text-primary-900 mb-2 flex items-center">
                  <LightBulbIcon className="h-5 w-5 mr-2" />
                  Ce qui arrive bientôt
                </h4>
                <ul className="text-sm text-primary-800 space-y-1">
                  <li>• Glossaire des termes Valorant</li>
                  <li>• Stratégies et tactiques d'équipe</li>
                  <li>• Rôles et responsabilités</li>
                  <li>• Concepts de communication</li>
                  <li>• Terminologie des tournois</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Rôles & Positions
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Duelist</span>
                  <span className="text-gray-400">En cours</span>
                </div>
                <div className="flex justify-between">
                  <span>Controller</span>
                  <span className="text-gray-400">En cours</span>
                </div>
                <div className="flex justify-between">
                  <span>Initiator</span>
                  <span className="text-gray-400">En cours</span>
                </div>
                <div className="flex justify-between">
                  <span>Sentinel</span>
                  <span className="text-gray-400">En cours</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <LightBulbIcon className="h-6 w-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Stratégies
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Split Push</span>
                  <span className="text-gray-400">En cours</span>
                </div>
                <div className="flex justify-between">
                  <span>Rush</span>
                  <span className="text-gray-400">En cours</span>
                </div>
                <div className="flex justify-between">
                  <span>Fake</span>
                  <span className="text-gray-400">En cours</span>
                </div>
                <div className="flex justify-between">
                  <span>Retake</span>
                  <span className="text-gray-400">En cours</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <BookOpenIcon className="h-6 w-6 text-primary-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Communication
                </h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Callouts</span>
                  <span className="text-gray-400">En cours</span>
                </div>
                <div className="flex justify-between">
                  <span>Comms</span>
                  <span className="text-gray-400">En cours</span>
                </div>
                <div className="flex justify-between">
                  <span>Pings</span>
                  <span className="text-gray-400">En cours</span>
                </div>
                <div className="flex justify-between">
                  <span>Timing</span>
                  <span className="text-gray-400">En cours</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="mt-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Progression du développement
              </h3>
              <span className="text-sm text-gray-500">15%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: '5%' }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Estimation de sortie :Août 2025
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

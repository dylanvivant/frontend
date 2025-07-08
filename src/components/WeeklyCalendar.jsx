import React from 'react';
import EventCard from './EventCard';
import { format, addDays, startOfWeek, isToday, isSameDay } from 'date-fns';
import fr from 'date-fns/locale/fr';

const daysOfWeek = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
];

const WeeklyCalendar = ({
  weekStart,
  eventsByDay,
  onPrevWeek,
  onNextWeek,
  onEventClick,
  onEventEdit, // Nouvelle prop pour l'édition
  onEventDelete, // Nouvelle prop pour la suppression
  userRole,
  currentUserId,
  onGoToCurrentWeek,
}) => {
  const today = new Date();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <button
          onClick={onPrevWeek}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Précédente
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">
            {format(weekStart, 'MMMM yyyy', { locale: fr })}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Semaine du {format(weekStart, 'dd', { locale: fr })} au{' '}
            {format(addDays(weekStart, 6), 'dd MMMM', { locale: fr })}
          </p>
          <button
            className="mt-3 px-4 py-2 bg-primary-100 rounded hover:bg-primary-200 text-primary-700 font-medium transition-colors"
            onClick={onGoToCurrentWeek}
          >
            Semaine en cours
          </button>
        </div>

        <button
          onClick={onNextWeek}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Suivante
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Grille du calendrier */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-4">
          {daysOfWeek.map((day, idx) => {
            const date = addDays(weekStart, idx);
            const events = eventsByDay[format(date, 'yyyy-MM-dd')] || [];
            const isCurrentDay = isToday(date);
            const dayNumber = format(date, 'dd');
            const dayMonth = format(date, 'MMM', { locale: fr });

            return (
              <div key={day} className="flex flex-col">
                {/* En-tête du jour */}
                <div
                  className={`text-center p-3 rounded-t-lg border-b-2 ${
                    isCurrentDay
                      ? 'bg-primary-50 border-primary-200'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div
                    className={`text-xs font-medium uppercase tracking-wide ${
                      isCurrentDay ? 'text-primary-600' : 'text-gray-500'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </div>
                  <div
                    className={`text-lg font-bold mt-1 ${
                      isCurrentDay ? 'text-primary-700' : 'text-gray-900'
                    }`}
                  >
                    {dayNumber}
                  </div>
                  <div
                    className={`text-xs ${
                      isCurrentDay ? 'text-primary-500' : 'text-gray-400'
                    }`}
                  >
                    {dayMonth}
                  </div>
                </div>

                {/* Contenu du jour */}
                <div
                  className={`flex-1 p-3 min-h-[200px] bg-white border-l border-r border-b rounded-b-lg ${
                    isCurrentDay
                      ? 'border-primary-100 bg-primary-50/30'
                      : 'border-gray-100'
                  }`}
                >
                  {events.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <svg
                          className="w-8 h-8 mx-auto text-gray-300 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-xs text-gray-400">Aucun événement</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {events.slice(0, 3).map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={() => onEventClick(event)}
                          onEdit={onEventEdit}
                          onDelete={onEventDelete} // Nouvelle prop pour la suppression
                          userRole={userRole}
                          currentUserId={currentUserId}
                          showEditButton={true}
                        />
                      ))}
                      {events.length > 3 && (
                        <div className="text-xs text-center text-gray-500 py-1 cursor-pointer hover:text-gray-700">
                          +{events.length - 3} autre
                          {events.length - 3 > 1 ? 's' : ''} événement
                          {events.length - 3 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Légende des types d'événements */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Types d'événements
          </h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Entrainement</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Coaching</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Session de jeu</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Tournois</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-gray-600">Practices</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;

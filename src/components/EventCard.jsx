import { formatTimeAsLocal } from '../utils/helpers';

const typeColors = {
  coaching: {
    bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  session_jeu: {
    bg: 'bg-gradient-to-r from-green-50 to-green-100',
    border: 'border-green-200',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  tournois: {
    bg: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
  },
  practices: {
    bg: 'bg-gradient-to-r from-purple-50 to-purple-100',
    border: 'border-purple-200',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  entrainement: {
    bg: 'bg-gradient-to-r from-red-50 to-red-100',
    border: 'border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
};

const EventCard = ({
  event,
  onClick,
  onEdit,
  onDelete, // Nouvelle prop pour la suppression
  userRole,
  currentUserId,
  showEditButton = true,
}) => {
  if (!event) return null;

  const type =
    (event.event_types && event.event_types.name) ||
    event.type ||
    event.event_type ||
    'entrainement';
  const colors = typeColors[type] || {
    bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
    border: 'border-gray-200',
    text: 'text-gray-700',
    dot: 'bg-gray-500',
  };

  // Utiliser formatTimeAsLocal pour éviter les problèmes de fuseau horaire
  const startTime = formatTimeAsLocal(event.start_time);
  const endTime = formatTimeAsLocal(event.end_time);

  // Vérifier si l'utilisateur peut éditer cet événement
  const canEdit =
    userRole === 'Capitaine' ||
    (userRole === 'Coach' && event.created_by === currentUserId) ||
    event.created_by === currentUserId;

  // Même logique pour la suppression
  const canDelete = canEdit;

  const handleEditClick = (e) => {
    e.stopPropagation(); // Empêcher la propagation vers le onClick principal
    if (onEdit) {
      onEdit(event);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Empêcher la propagation vers le onClick principal
    if (
      onDelete &&
      confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')
    ) {
      onDelete(event.id);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <div
      className={`mb-3 p-3 rounded-lg cursor-pointer w-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] border ${colors.bg} ${colors.border} group relative`}
      title={event.title}
      onClick={handleCardClick}
    >
      {/* Boutons d'action */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
        {/* Bouton d'édition */}
        {canEdit && showEditButton && onEdit && (
          <button
            className={`p-1 rounded ${colors.bg} ${colors.text} hover:bg-opacity-80`}
            title="Modifier l'événement"
            onClick={handleEditClick}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        )}

        {/* Bouton de suppression */}
        {canDelete && onDelete && (
          <button
            className={`p-1 rounded bg-red-100 text-red-600 hover:bg-red-200`}
            title="Supprimer l'événement"
            onClick={handleDeleteClick}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-start justify-between mb-2">
        <div
          className={`w-2 h-2 rounded-full ${colors.dot} mt-1 flex-shrink-0`}
        ></div>
        <div className="flex-1 ml-2 mr-6">
          <div
            className={`font-semibold text-sm leading-tight truncate ${colors.text} group-hover:text-opacity-80`}
          >
            {event.title}
          </div>
        </div>
      </div>

      <div className="ml-4">
        <div className={`text-xs font-medium ${colors.text} opacity-75 mb-1`}>
          {startTime}
          {endTime !== '--:--' ? ` - ${endTime}` : ''}
        </div>

        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${colors.bg} ${colors.text} font-medium border ${colors.border}`}
          >
            {type.replace('_', ' ')}
          </span>
          {Array.isArray(event.maps_played) && event.maps_played.length > 0 && (
            <div className={`text-xs ${colors.text} opacity-60`}>
              {event.maps_played.length} map
              {event.maps_played.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Affichage des participants */}
        {event.event_participants && event.event_participants.length > 0 && (
          <div className={`text-xs ${colors.text} opacity-60 mb-1`}>
            {event.event_participants.length} participant
            {event.event_participants.length > 1 ? 's' : ''}
          </div>
        )}

        {/* Affichage du nombre de parties */}
        {event.games_count && (
          <div className={`text-xs ${colors.text} opacity-60`}>
            {event.games_count} partie{event.games_count > 1 ? 's' : ''}
          </div>
        )}

        {/* Affichage de l'équipe adverse pour les tournois */}
        {event.opponent_teams && event.opponent_teams.name && (
          <div className={`text-xs ${colors.text} opacity-60 mt-1`}>
            vs {event.opponent_teams.name}
          </div>
        )}

        {/* Indicateur de récurrence */}
        {event.is_recurring && (
          <div
            className={`text-xs ${colors.text} opacity-60 mt-1 flex items-center`}
          >
            <svg
              className="w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Récurrent
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;

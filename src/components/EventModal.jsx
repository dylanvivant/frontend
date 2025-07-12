import { useState, useEffect, useMemo } from 'react';
import InviteModal from './InviteModal';

const recurrencePatterns = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' },
  { value: 'yearly', label: 'Annuel' },
];

const daysOfWeek = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
];

const EventModal = ({
  isOpen,
  onClose,
  onSave,
  eventTypes,
  userRole,
  currentUserId,
  opponentTeams = [],
  users = [],
  availableMaps = [], // <--- Ajoute cette ligne
  editingEvent = null,
}) => {
  const [form, setForm] = useState({
    title: '',
    type: '',
    start_time: '',
    end_time: '',
    is_recurring: false,
    recurrence_pattern: null,
    recurrence_interval: 1,
    recurrence_days_of_week: [],
    recurrence_end_date: null,
    maps_played: [], // Temporairement en array vide
    has_games_count: false,
    games_count: null,
    opponent_team_id: null,
    invited_users: [],
  });

  const [showInviteModal, setShowInviteModal] = useState(false);

  // Charger les données de l'événement à éditer
  useEffect(() => {
    if (editingEvent) {
      setForm({
        title: editingEvent.title || '',
        type: editingEvent.event_types?.name || editingEvent.type || '',
        start_time: editingEvent.start_time
          ? new Date(editingEvent.start_time).toISOString().slice(0, 16)
          : '',
        end_time: editingEvent.end_time
          ? new Date(editingEvent.end_time).toISOString().slice(0, 16)
          : '',
        is_recurring: editingEvent.is_recurring || false,
        recurrence_pattern: editingEvent.recurrence_pattern || null,
        recurrence_interval: editingEvent.recurrence_interval || 1,
        recurrence_days_of_week: editingEvent.recurrence_days_of_week || [],
        recurrence_end_date: editingEvent.recurrence_end_date
          ? new Date(editingEvent.recurrence_end_date)
              .toISOString()
              .slice(0, 10)
          : null,
        maps_played: editingEvent.maps_played || [],
        has_games_count: !!editingEvent.games_count,
        games_count: editingEvent.games_count || null,
        opponent_team_id: editingEvent.opponent_team_id || null,
        invited_users:
          editingEvent.event_participants?.map((p) => p.users?.id) || [],
      });
    } else {
      // Reset form pour création
      setForm({
        title: '',
        type: '',
        start_time: '',
        end_time: '',
        is_recurring: false,
        recurrence_pattern: null,
        recurrence_interval: 1,
        recurrence_days_of_week: [],
        recurrence_end_date: null,
        maps_played: [],
        has_games_count: false,
        games_count: null,
        opponent_team_id: null,
        invited_users: [],
      });
    }
  }, [editingEvent, isOpen]);

  useEffect(() => {
    if (isOpen && !editingEvent && eventTypes.length > 0) {
      console.log('🔧 Initializing type for role:', userRole);
      console.log('🔧 Available event types:', eventTypes);

      if (userRole === 'Joueur') {
        // Chercher "session_jeu" ou similaire
        const sessionType = eventTypes.find(
          (t) =>
            t.name === 'session_jeu' ||
            t.name?.toLowerCase().includes('session') ||
            t.label?.toLowerCase().includes('session')
        );
        console.log('🔧 Found session type for Joueur:', sessionType);
        if (sessionType) {
          setForm((prev) => ({
            ...prev,
            type: sessionType.name,
          }));
        }
      } else if (userRole === 'Coach') {
        // Chercher "coaching"
        const coachingType = eventTypes.find(
          (t) =>
            t.name === 'coaching' ||
            t.name?.toLowerCase().includes('coach') ||
            t.label?.toLowerCase().includes('coach')
        );
        console.log('🔧 Found coaching type for Coach:', coachingType);
        if (coachingType) {
          setForm((prev) => ({
            ...prev,
            type: coachingType.name,
          }));
        }
      }
    }
  }, [isOpen, userRole, eventTypes, editingEvent]);

  // Correction du filtrage des types d'événement
  const filteredTypes = useMemo(() => {
    if (userRole === 'Coach') {
      return eventTypes.filter((type) => type.name === 'coaching');
    } else if (userRole === 'Capitaine') {
      return eventTypes;
    } else {
      // Pour les Joueurs, filtrer les types appropriés (session_jeu)
      return eventTypes.filter(
        (type) =>
          type.name === 'session_jeu' ||
          type.name?.toLowerCase().includes('session')
      );
    }
  }, [userRole, eventTypes]);

  // Afficher la section récurrence uniquement pour les rôles autorisés
  const canSetRecurrence = userRole === 'Capitaine';

  // Afficher opponent_team_id uniquement pour tournois
  const showOpponent = form.type === 'tournois' || form.type === 'practices';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'is_recurring') {
      setForm({ ...form, [name]: checked });
    } else if (type === 'checkbox' && name === 'has_games_count') {
      setForm({
        ...form,
        [name]: checked,
        games_count: checked ? form.games_count : null,
      });
    } else if (type === 'checkbox' && name === 'recurrence_days_of_week') {
      const intVal = parseInt(value, 10);
      setForm({
        ...form,
        recurrence_days_of_week: checked
          ? [...form.recurrence_days_of_week, intVal]
          : form.recurrence_days_of_week.filter((d) => d !== intVal),
      });
    } else if (name === 'maps_played') {
      // Version simplifiée: champ texte séparé par des virgules
      setForm({
        ...form,
        maps_played: value
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s),
      });
    } else if (name === 'invited_users') {
      const userId = value;
      const isSelected = form.invited_users.includes(userId);
      setForm({
        ...form,
        invited_users: isSelected
          ? form.invited_users.filter((id) => id !== userId)
          : [...form.invited_users, userId],
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleInvite = (selectedUserIds) => {
    setForm({ ...form, invited_users: selectedUserIds });
    setShowInviteModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('📤 EventModal handleSubmit - form.type:', form.type);
    console.log('📤 EventModal handleSubmit - full form:', form);

    if (form.type !== 'entrainement' && form.invited_users.length === 0) {
      alert('Veuillez inviter au moins un membre.');
      return;
    }

    // Trouver l'event_type_id correspondant au type sélectionné
    const selectedType = eventTypes.find((t) => t.name === form.type);
    const event_type_id = selectedType ? selectedType.id : undefined;
    console.log('📤 EventModal found selectedType:', selectedType);
    console.log('📤 EventModal mapped event_type_id:', event_type_id);

    const submitData = {
      ...form,
      event_type_id,
      recurrence_days_of_week:
        form.recurrence_days_of_week.length > 0
          ? form.recurrence_days_of_week
          : null,
      id: editingEvent?.id,
    };
    // On retire le champ 'type' car le backend attend event_type_id
    delete submitData.type;
    onSave(submitData);
  };

  if (!isOpen) return null;

  const isEditing = !!editingEvent;
  const modalTitle = isEditing ? "Modifier l'événement" : 'Créer un événement';
  const submitButtonText = isEditing
    ? "Modifier l'événement"
    : "Créer l'événement";
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onSubmit={handleSubmit}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{modalTitle}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'événement
              </label>
              <input
                name="title"
                placeholder="Nom de l'événement"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d&apos;événement
              </label>
              {userRole === 'Capitaine' ? (
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                >
                  <option value="">
                    Sélectionner un type d&apos;événement
                  </option>
                  {filteredTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.label || type.name}
                    </option>
                  ))}
                </select>
              ) : userRole === 'Coach' ? (
                <select
                  name="type"
                  value={form.type || filteredTypes[0]?.name || ''}
                  onChange={handleChange}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                >
                  <option value={form.type || filteredTypes[0]?.name || ''}>
                    {filteredTypes[0]?.label ||
                      filteredTypes[0]?.name ||
                      'Aucun type disponible'}
                  </option>
                </select>
              ) : (
                <select
                  name="type"
                  value={form.type || filteredTypes[0]?.name || ''}
                  onChange={handleChange}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                >
                  <option value={form.type || filteredTypes[0]?.name || ''}>
                    {filteredTypes[0]?.label || filteredTypes[0]?.name || ''}
                  </option>
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Début
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={form.start_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fin
                </label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={form.end_time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section récurrence */}
          {canSetRecurrence && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Récurrence
              </h3>
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="is_recurring"
                  checked={form.is_recurring}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Événement récurrent
                </span>
              </label>
              {form.is_recurring && (
                <div className="space-y-4 pl-7">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      name="recurrence_pattern"
                      value={form.recurrence_pattern || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      required
                    >
                      <option value="">Fréquence</option>
                      {recurrencePatterns.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      name="recurrence_interval"
                      min={1}
                      value={form.recurrence_interval}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Intervalle"
                      required
                    />
                  </div>
                  {form.recurrence_pattern === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jours de la semaine
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {daysOfWeek.map((day) => (
                          <label key={day.value} className="flex items-center">
                            <input
                              type="checkbox"
                              name="recurrence_days_of_week"
                              value={day.value}
                              checked={form.recurrence_days_of_week.includes(
                                day.value
                              )}
                              onChange={handleChange}
                              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {day.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin de récurrence
                    </label>
                    <input
                      type="date"
                      name="recurrence_end_date"
                      value={form.recurrence_end_date || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section maps et games - VERSION SIMPLIFIÉE */}
          {form.type && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Détails du jeu
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maps jouées (multi-sélection)
                  </label>
                  <select
                    name="maps_played"
                    multiple
                    value={form.maps_played}
                    onChange={(e) => {
                      const selected = Array.from(
                        e.target.selectedOptions,
                        (opt) => opt.value
                      );
                      setForm({ ...form, maps_played: selected });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    {availableMaps.map((map) => (
                      <option key={map.id} value={map.name}>
                        {map.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="has_games_count"
                      checked={form.has_games_count}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      Définir un nombre de parties
                    </span>
                  </label>
                  {form.has_games_count && (
                    <input
                      type="number"
                      name="games_count"
                      placeholder="Nombre de parties"
                      value={form.games_count || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      min={1}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section équipe adverse */}
          {showOpponent && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Équipe adverse
              </h3>
              <select
                name="opponent_team_id"
                value={form.opponent_team_id || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">Sélectionner une équipe adverse</option>
                {opponentTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section invitations */}
          {form.type && form.type !== 'entrainement' && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Membres invités ({form.invited_users.length} sélectionné
                  {form.invited_users.length > 1 ? 's' : ''})
                </h3>
                <button
                  type="button"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                  onClick={() => setShowInviteModal(true)}
                >
                  Gérer les invitations
                </button>
              </div>

              {form.invited_users.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {form.invited_users.map((userId) => {
                    const user = users.find((u) => u.id === userId);
                    return user ? (
                      <div
                        key={userId}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">{user.pseudo}</span>
                        <button
                          type="button"
                          onClick={() =>
                            handleChange({
                              target: { name: 'invited_users', value: userId },
                            })
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {form.invited_users.length === 0 && (
                <div className="text-xs text-red-500 mt-1">
                  Veuillez inviter au moins un membre.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 transition-colors"
            >
              {submitButtonText}
            </button>
          </div>
        </div>
      </form>

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        users={users.filter((u) => u.id !== currentUserId)}
        eventType={form.type}
        userRole={userRole}
        eventTitle={form.title}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default EventModal;

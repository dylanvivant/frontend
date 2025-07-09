import { useState, useEffect, useCallback } from 'react';
import { startOfWeek, addDays, format, endOfWeek } from 'date-fns';
import WeeklyCalendar from '../components/WeeklyCalendar';
import Layout from '../components/layout/Layout';
import EventModal from '../components/EventModal';
import { useAuth } from '../contexts/AuthContext';
import { eventsAPI, teamsAPI, usersAPI, mapsAPI } from '../services/api';

const OpponentTeamModal = ({ isOpen, onClose, onSave, isLoading }) => {
  const [form, setForm] = useState({
    name: '',
    average_rank: '',
    contact_email: '',
    contact_discord: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onSave(form);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-4">Ajouter une équipe adverse</h2>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Nom *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Niveau moyen</label>
          <input
            name="average_rank"
            value={form.average_rank}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Email de contact
          </label>
          <input
            name="contact_email"
            type="email"
            value={form.contact_email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Discord de contact
          </label>
          <input
            name="contact_discord"
            value={form.contact_discord}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700"
            disabled={isLoading || !form.name}
          >
            {isLoading ? 'Ajout...' : 'Ajouter'}
          </button>
        </div>
      </form>
    </div>
  );
};

const getWelcomeMessage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bonne après-midi';
  return 'Bonsoir';
};

const Events = () => {
  const { user } = useAuth();

  // État pour la semaine affichée (lundi)
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [eventsByDay, setEventsByDay] = useState({});
  const [eventTypes, setEventTypes] = useState([]);
  const [opponentTeams, setOpponentTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [availableMaps, setAvailableMaps] = useState([]); // Nouveau : maps disponibles
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null); // Nouveau : événement en cours d'édition
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Nouveau : état de sauvegarde
  const [showOpponentModal, setShowOpponentModal] = useState(false);
  const [isAddingOpponent, setIsAddingOpponent] = useState(false);

  // Charger les types d'événements
  useEffect(() => {
    const loadEventTypes = async () => {
      try {
        const res = await eventsAPI.getTypes();
        setEventTypes(res.data?.data?.eventTypes || []);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des types d'événements:",
          error
        );
      }
    };
    loadEventTypes();
  }, []);

  // Charger les équipes adverses (pour les tournois)
  useEffect(() => {
    const loadOpponentTeams = async () => {
      try {
        const res = await teamsAPI.getOpponents();
        setOpponentTeams(res.data?.data?.opponentTeams || []);
      } catch (error) {
        console.error('Erreur lors du chargement des équipes adverses:', error);
      }
    };
    loadOpponentTeams();
  }, []);

  // Charger les utilisateurs (pour les invitations)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await usersAPI.getAll();
        setUsers(res.data?.data?.members || []);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    };
    loadUsers();
  }, []);

  // Nouveau : Charger les maps disponibles
  useEffect(() => {
    const loadMaps = async () => {
      try {
        const res = await mapsAPI.getAll();
        setAvailableMaps(res.data?.data?.maps || []);
      } catch (error) {
        console.error('Erreur lors du chargement des maps:', error);
      }
    };
    loadMaps();
  }, []);

  // Charger les événements de la semaine
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const start = format(weekStart, 'yyyy-MM-dd');
      const end = format(
        endOfWeek(weekStart, { weekStartsOn: 1 }),
        'yyyy-MM-dd'
      );
      const res = await eventsAPI.getAll({ start, end, limit: 100 });
      const events = res.data?.data?.events || [];

      // Fonction pour développer les événements récurrents
      const expandRecurringEvents = (events) => {
        const expandedEvents = [];

        events.forEach((event) => {
          if (event.is_recurring && event.recurrence_pattern) {
            const startDate = new Date(event.start_time);
            const endDate = new Date(event.recurrence_end_date);
            const eventDuration = event.end_time
              ? new Date(event.end_time) - startDate
              : 60 * 60 * 1000; // 1 heure par défaut

            if (
              event.recurrence_pattern === 'weekly' &&
              Array.isArray(event.recurrence_days_of_week)
            ) {
              // Pour chaque semaine entre startDate et endDate
              let current = new Date(startDate);
              current.setHours(
                startDate.getHours(),
                startDate.getMinutes(),
                0,
                0
              );
              while (current <= endDate) {
                // Pour chaque jour de la semaine sélectionné
                event.recurrence_days_of_week.forEach((dayOfWeek) => {
                  // Trouver la date de ce jour dans la semaine courante
                  const occurrence = new Date(current);
                  const currentDay = occurrence.getDay();
                  // Calculer l'écart pour atteindre le bon jour
                  let diff = dayOfWeek - currentDay;
                  if (diff < 0) diff += 7;
                  occurrence.setDate(occurrence.getDate() + diff);
                  // Ne pas dépasser la date de fin
                  if (occurrence >= startDate && occurrence <= endDate) {
                    expandedEvents.push({
                      ...event,
                      id: `${event.id}_${occurrence.getTime()}`,
                      start_time: occurrence.toISOString(),
                      end_time: new Date(
                        occurrence.getTime() + eventDuration
                      ).toISOString(),
                      is_recurring_instance: true,
                      original_event_id: event.id,
                    });
                  }
                });
                // Passer à la semaine suivante
                current.setDate(current.getDate() + 7);
              }
            } else {
              // Autres patterns (daily, monthly, yearly)
              let currentDate = new Date(startDate);
              const getNextDate = (date, pattern, interval) => {
                const next = new Date(date);
                switch (pattern) {
                  case 'daily':
                    next.setDate(next.getDate() + interval);
                    break;
                  case 'monthly':
                    next.setMonth(next.getMonth() + interval);
                    break;
                  case 'yearly':
                    next.setFullYear(next.getFullYear() + interval);
                    break;
                  default:
                    next.setDate(next.getDate() + interval);
                }
                return next;
              };
              while (currentDate <= endDate) {
                expandedEvents.push({
                  ...event,
                  id: `${event.id}_${currentDate.getTime()}`,
                  start_time: currentDate.toISOString(),
                  end_time: new Date(
                    currentDate.getTime() + eventDuration
                  ).toISOString(),
                  is_recurring_instance: true,
                  original_event_id: event.id,
                });
                currentDate = getNextDate(
                  currentDate,
                  event.recurrence_pattern,
                  event.recurrence_interval
                );
              }
            }
          } else {
            // Événement non récurrent
            expandedEvents.push(event);
          }
        });
        return expandedEvents;
      };

      // Développer les événements récurrents
      const expandedEvents = expandRecurringEvents(events);

      // Grouper par jour
      const grouped = {};
      for (let i = 0; i < 7; i++) {
        const day = format(addDays(weekStart, i), 'yyyy-MM-dd');
        grouped[day] = [];
      }

      expandedEvents.forEach((event) => {
        const day = format(new Date(event.start_time), 'yyyy-MM-dd');
        if (grouped[day]) grouped[day].push(event);
      });

      setEventsByDay(grouped);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setIsLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Navigation semaine
  const handlePrevWeek = () => setWeekStart((prev) => addDays(prev, -7));
  const handleNextWeek = () => setWeekStart((prev) => addDays(prev, 7));

  // Aller à la semaine courante
  const handleGoToCurrentWeek = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Nouveau : Gestion de la création d'événement
  const handleCreateEvent = () => {
    setEditingEvent(null);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  // Clic sur un événement (voir détails)
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    console.log('Événement cliqué:', event);
    // Ici on pourrait ouvrir une modal de détails
  };

  // Nouveau : Édition d'un événement
  const handleEventEdit = (event) => {
    setEditingEvent(event);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  // Sauvegarde d'un événement (création ou modification)
  const handleSaveEvent = async (form) => {
    setIsSaving(true);
    try {
      // Trouver l'id du type d'événement
      const selectedType = eventTypes.find((t) => t.name === form.type);
      const event_type_id = selectedType ? selectedType.id : undefined;

      // Mapping des champs pour l'API
      const payload = {
        title: form.title,
        event_type_id,
        start_time: form.start_time,
        end_time: form.end_time,
        description: form.description || null,
        is_recurring: !!form.is_recurring,
        recurrence_pattern: form.is_recurring ? form.recurrence_pattern : null,
        recurrence_interval: form.is_recurring
          ? Number(form.recurrence_interval)
          : null,
        recurrence_days_of_week:
          form.is_recurring && Array.isArray(form.recurrence_days_of_week)
            ? form.recurrence_days_of_week
            : null,
        recurrence_end_date: form.is_recurring
          ? form.recurrence_end_date
          : null,
        opponent_team_id: form.opponent_team_id
          ? Number(form.opponent_team_id)
          : null,
        maps_played:
          form.maps_played && form.maps_played.length > 0
            ? form.maps_played
            : null,
        games_count:
          form.has_games_count && form.games_count
            ? Number(form.games_count)
            : null,
        participant_ids:
          form.invited_users && form.invited_users.length > 0
            ? form.invited_users
            : null,
      };

      // Nettoyer les champs inutiles
      Object.keys(payload).forEach((key) => {
        if (
          payload[key] === null ||
          payload[key] === '' ||
          payload[key] === undefined
        ) {
          delete payload[key];
        }
      });

      if (editingEvent) {
        // Modification d'un événement existant
        await eventsAPI.update(editingEvent.id, payload);
        console.log('Événement modifié avec succès');
      } else {
        // Création d'un nouvel événement
        await eventsAPI.create(payload);
        console.log('Événement créé avec succès');
      }

      setShowEventModal(false);
      setEditingEvent(null);
      setSelectedEvent(null);

      // Recharger les événements
      await fetchEvents();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert("Erreur lors de la sauvegarde de l'événement");
    } finally {
      setIsSaving(false);
    }
  };

  // Nouveau : Suppression d'un événement
  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    setIsSaving(true);
    try {
      await eventsAPI.delete(eventId);
      console.log('Événement supprimé avec succès');
      // Recharger les événements
      await fetchEvents();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert("Erreur lors de la suppression de l'événement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setEditingEvent(null);
  };

  // Ajout d'une équipe adverse
  const handleAddOpponentTeam = async (form) => {
    setIsAddingOpponent(true);
    try {
      await teamsAPI.createOpponent(form);
      setShowOpponentModal(false);
      // Recharge la liste
      const res = await teamsAPI.getOpponents();
      setOpponentTeams(res.data?.data?.opponentTeams || []);
    } catch (error) {
      alert("Erreur lors de l'ajout de l'équipe adverse");
    } finally {
      setIsAddingOpponent(false);
    }
  };

  // Calculer les statistiques pour la semaine actuelle
  const weekEvents = Object.values(eventsByDay).flat();
  const stats = {
    total: weekEvents.length,
    sessionJeu: weekEvents.filter(
      (e) =>
        e.event_types?.name === 'session de jeu' || e.type === 'session de jeu'
    ).length,
    tournois: weekEvents.filter(
      (e) => e.event_types?.name === 'tournois' || e.type === 'tournois'
    ).length,
    coaching: weekEvents.filter(
      (e) => e.event_types?.name === 'coaching' || e.type === 'coaching'
    ).length,
    entrainement: weekEvents.filter(
      (e) => e.event_types?.name === 'entrainement' || e.type === 'entrainement'
    ).length,
  };

  // Vérifier les permissions pour créer des événements
  const canCreateEvents = user?.role === 'Capitaine' || user?.role === 'Coach';

  return (
    <Layout>
      <div className="w-full bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* En-tête de bienvenue */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getWelcomeMessage()}, {user?.pseudo}
                </h1>
                <p className="text-sm text-gray-600">
                  Voici le planning des événements de l'équipe
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Header avec bouton conditionnel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Planning des événements
                </h1>
                <p className="text-gray-600 mt-1">
                  Gérez et planifiez vos sessions, tournois et entraînements
                </p>
              </div>
              <div className="flex items-center gap-2">
                {user?.role === 'Capitaine' && (
                  <button
                    className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm ml-2"
                    onClick={() => setShowOpponentModal(true)}
                    disabled={isLoading || isSaving}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Ajouter une équipe adverse
                  </button>
                )}
                {canCreateEvents && (
                  <button
                    className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCreateEvent}
                    disabled={isLoading || isSaving}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    {isSaving ? 'Sauvegarde...' : 'Créer un événement'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[
              {
                label: 'Total cette semaine',
                value: stats.total,
                color: 'primary',
                icon: (
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ),
              },
              {
                label: 'Entraînements',
                value: stats.entrainement,
                color: 'red',
                icon: (
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
              },
              {
                label: 'Sessions de jeu',
                value: stats.sessionJeu,
                color: 'green',
                icon: (
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
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
              },
              {
                label: 'Tournois',
                value: stats.tournois,
                color: 'yellow',
                icon: (
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
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                ),
              },
              {
                label: 'Coaching',
                value: stats.coaching,
                color: 'blue',
                icon: (
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                ),
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4"
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}
                  >
                    {stat.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Calendrier */}
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">
                  Chargement des événements...
                </span>
              </div>
            </div>
          ) : (
            <WeeklyCalendar
              weekStart={weekStart}
              eventsByDay={eventsByDay}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onEventClick={handleEventClick}
              onEventEdit={handleEventEdit}
              onEventDelete={handleDeleteEvent} // Nouveau : fonction de suppression
              userRole={user?.role}
              currentUserId={user?.id}
              onGoToCurrentWeek={handleGoToCurrentWeek}
            />
          )}

          {/* Modal de création/édition d'événement */}
          <EventModal
            isOpen={showEventModal}
            onClose={handleCloseModal}
            onSave={handleSaveEvent}
            eventTypes={eventTypes}
            userRole={user?.role}
            currentUserId={user?.id} // Nouveau : ID utilisateur actuel
            opponentTeams={opponentTeams}
            users={users}
            editingEvent={editingEvent} // Nouveau : événement en cours d'édition
            availableMaps={availableMaps} // Nouveau : maps disponibles
            isLoading={isSaving} // Indicateur de chargement
          />
          <OpponentTeamModal
            isOpen={showOpponentModal}
            onClose={() => setShowOpponentModal(false)}
            onSave={handleAddOpponentTeam}
            isLoading={isAddingOpponent}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Events;

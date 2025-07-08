import React, { useState } from 'react';

const InviteModal = ({
  isOpen,
  onClose,
  onInvite,
  users,
  eventType,
  userRole,
  currentUserId, // Ajout de currentUserId en props
  eventTitle = "l'événement",
}) => {
  // Filtrer les utilisateurs selon le type d'event et le rôle
  const filteredUsers = users.filter((user) => user.id !== currentUserId);

  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les utilisateurs selon le terme de recherche
  const searchFilteredUsers = filteredUsers.filter(
    (user) =>
      user.pseudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.roles?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (id) => {
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((i) => i !== id) : [...sel, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === searchFilteredUsers.length) {
      setSelected([]);
    } else {
      setSelected(searchFilteredUsers.map((user) => user.id));
    }
  };

  const handleInvite = () => {
    onInvite(selected);
    setSelected([]);
    setSearchTerm('');
  };

  const handleClose = () => {
    onClose();
    setSelected([]);
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Inviter des membres
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Sélectionnez les membres à inviter à {eventTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
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

        {/* Barre de recherche et contrôles */}
        <div className="p-6 border-b border-gray-100">
          <div className="relative mb-4">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un membre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selected.length} / {searchFilteredUsers.length} sélectionné
              {selected.length > 1 ? 's' : ''}
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selected.length === searchFilteredUsers.length
                ? 'Tout désélectionner'
                : 'Tout sélectionner'}
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="flex-1 overflow-y-auto p-6">
          {searchFilteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-500">
                {searchTerm ? 'Aucun membre trouvé' : 'Aucun membre disponible'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {searchFilteredUsers.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(user.id)}
                    onChange={() => handleToggle(user.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 group-hover:text-gray-700">
                        {user.pseudo}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          user.roles?.name === 'Joueur'
                            ? 'bg-green-100 text-green-700'
                            : user.roles?.name === 'Capitaine'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.roles?.name}
                      </span>
                    </div>
                    {user.email && (
                      <div className="text-sm text-gray-500 mt-1">
                        {user.email}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleInvite}
              disabled={selected.length === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Inviter {selected.length > 0 && `(${selected.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;

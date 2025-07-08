import { useState } from 'react';
import Modal from './Modal';

export default function ForcePasswordChangeModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      await onSubmit(newPassword);
      setSuccess('Mot de passe changé avec succès !');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setError(e.message || 'Erreur lors du changement de mot de passe.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} hideClose>
      <form onSubmit={handleSubmit} className="p-4 w-80 sm:w-96">
        <h2 className="text-xl font-bold mb-4 text-center">
          Changement de mot de passe obligatoire
        </h2>
        <p className="text-gray-600 text-sm mb-4 text-center">
          Pour des raisons de sécurité, vous devez définir un nouveau mot de
          passe avant d'accéder à la plateforme.
        </p>
        {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
        {success && (
          <div className="text-green-600 mb-2 text-center">{success}</div>
        )}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Nouveau mot de passe *
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            minLength={8}
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Confirmer le mot de passe *
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            minLength={8}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Changement...' : 'Changer le mot de passe'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

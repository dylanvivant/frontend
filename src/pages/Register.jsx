import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { validateEmail, validatePassword } from '../utils/helpers';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register: registerUser, error, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    clearError();

    const result = await registerUser(data);

    if (result.success) {
      setSuccess(true);
    } else {
      setError('root', { message: result.error });
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Inscription réussie !
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Vérifiez votre email pour activer votre compte.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Adresse email"
              type="email"
              {...register('email', {
                required: "L'email est requis",
                validate: (value) =>
                  validateEmail(value) || "Format d'email invalide",
              })}
              error={errors.email?.message}
              placeholder="votre.email@exemple.com"
            />

            <Input
              label="Pseudo"
              type="text"
              {...register('pseudo', {
                required: 'Le pseudo est requis',
                minLength: {
                  value: 2,
                  message: 'Le pseudo doit contenir au moins 2 caractères',
                },
                maxLength: {
                  value: 50,
                  message: 'Le pseudo ne peut pas dépasser 50 caractères',
                },
              })}
              error={errors.pseudo?.message}
              placeholder="Votre pseudo"
            />

            <Input
              label="Discord"
              type="text"
              {...register('discord_username', {
                required: 'Le nom Discord est requis',
                pattern: {
                  value: /^.{3,32}#[0-9]{4}$/,
                  message: 'Format Discord invalide (ex: Pseudo#1234)',
                },
              })}
              error={errors.discord_username?.message}
              placeholder="Pseudo#1234"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rang Valorant
              </label>
              <select
                {...register('rank', { required: 'Le rang est requis' })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Sélectionnez votre rang</option>
                <option value="Iron">Iron</option>
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
                <option value="Diamond">Diamond</option>
                <option value="Immortal">Immortal</option>
                <option value="Radiant">Radiant</option>
              </select>
              {errors.rank && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.rank.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de joueur
              </label>
              <select
                {...register('player_type_id', {
                  required: 'Le type de joueur est requis',
                })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Sélectionnez votre type</option>
                <option value="1">Duelist</option>
                <option value="2">Initiator</option>
                <option value="3">Controller</option>
                <option value="4">Sentinel</option>
              </select>
              {errors.player_type_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.player_type_id.message}
                </p>
              )}
            </div>

            <Input
              label="Mot de passe"
              type="password"
              {...register('password', {
                required: 'Le mot de passe est requis',
                validate: (value) =>
                  validatePassword(value) ||
                  'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
              })}
              error={errors.password?.message}
              placeholder="Votre mot de passe"
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              {...register('confirmPassword', {
                required: 'La confirmation du mot de passe est requise',
                validate: (value) =>
                  value === password ||
                  'Les mots de passe ne correspondent pas',
              })}
              error={errors.confirmPassword?.message}
              placeholder="Confirmez votre mot de passe"
            />
          </div>

          {(error || errors.root) && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">
                {error || errors.root?.message}
              </p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Créer mon compte
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;

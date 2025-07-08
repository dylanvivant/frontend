import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { validateEmail } from '../utils/helpers';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    clearError();

    const result = await login(data);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError('root', { message: result.error });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Connexion à votre compte
          </h2>
          {/* <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              créez un nouveau compte
            </Link>
          </p> */}
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
              label="Mot de passe"
              type="password"
              {...register('password', {
                required: 'Le mot de passe est requis',
              })}
              error={errors.password?.message}
              placeholder="Votre mot de passe"
            />
          </div>

          {(error || errors.root) && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">
                {error || errors.root?.message}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Se connecter
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Vous êtes joueur ? Connectez-vous avec les identifiants fournis par
          votre capitaine.
        </p>
      </div>
    </div>
  );
};

export default Login;

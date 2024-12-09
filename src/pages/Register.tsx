import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { register, RegisterInput, registerSchema } from '../lib/auth';
import { useAuth } from '../lib/auth-context';

export function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login: setUser } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
        companyName: formData.get('companyName') as string,
      };

      const parsed = registerSchema.parse(data);
      const user = await register(parsed);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building AI agents for your clients"
    >
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Full name"
            name="name"
            type="text"
            autoComplete="name"
            required
          />

          <Input
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            required
          />

          <Input
            label="Company name (optional)"
            name="companyName"
            type="text"
            autoComplete="organization"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>

        <Button type="submit" isLoading={isLoading}>
          Create account
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
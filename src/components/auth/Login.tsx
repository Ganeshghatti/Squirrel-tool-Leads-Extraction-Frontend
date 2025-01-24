'use client';

import React, { useState, FormEvent } from 'react';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormData {
  email: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  error?: {
    message: string;
    code: number;
    detail: string;
  };
}

const Login: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Redirect if already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token)
    if (token != null) {
      console.log('Already logged in')
      router.push('/dashboard'); // or wherever you want to redirect authenticated users
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {

      console.log(process.env.NEXT_PUBLIC_BACKEND_URI)
      const response: AxiosResponse<ApiResponse> = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/admin/login`,
        formData
      );

      if (response.data.success && response.data.token) {
        // Store token in session storage (not localStorage as per requirement)

        // console.log(response.data)
        await localStorage.setItem('token', response.data.token);
        
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Redirect to dashboard or home page
        router.push('/dashboard');
      } else {
        setError(response.data.error?.message || 'An unexpected error occurred');
      }
    } catch (err) {
      const error = err as AxiosError<ApiResponse>;
      setError(
        error.response?.data?.error?.message || 
        'An error occurred while trying to log in'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email address
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                variant="default"
              >
                {isLoading ? (
                  <span className="mr-2">
                    Loading...
                  </span>
                ) : "Login"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;

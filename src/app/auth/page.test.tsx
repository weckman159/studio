
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthPage from './page';

// --- Mocks ---

// Mock Next.js router
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

// Mock useToast hook
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock Firebase SDK functions
const mockSignInWithEmailAndPassword = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockUpdateProfile = jest.fn();
const mockSetDoc = jest.fn();

// Mock the custom hooks from @/firebase to return nothing, as we mock the direct SDK calls
jest.mock('@/firebase', () => ({
  useAuth: jest.fn().mockReturnValue({}),
  useFirestore: jest.fn().mockReturnValue({}),
}));

// Mock the actual 'firebase/auth' and 'firebase/firestore' modules
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
  createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
  updateProfile: (...args: any[]) => mockUpdateProfile(...args),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn((...args) => `mock/doc/path/${args.slice(1).join('/')}`),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  serverTimestamp: jest.fn(() => 'mock-server-timestamp'),
}));


// --- Tests ---

describe('AuthPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders login and registration tabs correctly', () => {
    render(<AuthPage />);
    expect(screen.getByText('Вход')).toBeInTheDocument();
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument();
  });

  it('allows user to successfully log in', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValue({ user: { uid: '123' } });
    render(<AuthPage />);

    fireEvent.change(screen.getAllByLabelText('Email')[0], { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getAllByLabelText('Пароль')[0], { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), 'test@example.com', 'password123');
      expect(mockToast).toHaveBeenCalledWith({ title: 'Успешный вход', description: 'С возвращением!' });
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows an error on failed login', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValue({ code: 'auth/invalid-credential' });
    render(<AuthPage />);

    fireEvent.change(screen.getAllByLabelText('Email')[0], { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getAllByLabelText('Пароль')[0], { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Неверный email или пароль',
      });
    });
  });

  it('allows user to successfully register', async () => {
    const mockUser = { uid: 'newUser123', email: 'new@example.com' };
    mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    mockUpdateProfile.mockResolvedValue(undefined);
    mockSetDoc.mockResolvedValue(undefined);

    render(<AuthPage />);

    // Switch to registration tab
    fireEvent.click(screen.getByText('Регистрация'));
    
    await waitFor(() => {
        expect(screen.getByLabelText('Имя пользователя')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Имя пользователя'), { target: { value: 'New User' } });
    fireEvent.change(screen.getAllByLabelText('Email')[1], { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getAllByLabelText('Пароль')[1], { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Создать аккаунт' }));

    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), 'new@example.com', 'password123');
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'New User' });
      expect(mockSetDoc).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith({ title: 'Регистрация успешна', description: 'Добро пожаловать в AutoSphere!' });
      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows an error on failed registration (email already in use)', async () => {
    mockCreateUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/email-already-in-use' });
    render(<AuthPage />);

    fireEvent.click(screen.getByText('Регистрация'));

    await waitFor(() => {
        expect(screen.getByLabelText('Имя пользователя')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Имя пользователя'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getAllByLabelText('Email')[1], { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getAllByLabelText('Пароль')[1], { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Создать аккаунт' }));

    await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
            variant: 'destructive',
            title: 'Ошибка',
            description: 'Этот email уже занят',
        });
    });
  });
});

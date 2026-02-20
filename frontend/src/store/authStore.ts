import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'hr' | 'employee';
  employeeId: string | null;
  name: string;
  department: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
      onRehydrate: (state: any) => {
        // Migrate old employeeId format (object) to new format (string)
        if (state.user?.employeeId && typeof state.user.employeeId === 'object') {
          state.user.employeeId = state.user.employeeId.employeeId || null;
        }
      },
    }
  )
);


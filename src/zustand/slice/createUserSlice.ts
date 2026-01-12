import { UserInfo } from '@/utils/auth';

export type UserSlice = {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
};

export const createUserSlice = (set: any): UserSlice => ({
  user: null,
  setUser: (user) => set({ user }),
});

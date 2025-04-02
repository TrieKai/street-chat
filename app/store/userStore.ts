import { create } from "zustand";
import {
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, provider } from "@/libs/firebase/firebase";
import { getAnonymousUserName } from "@/helpers/user";

import type { User } from "@/types/chatroom";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  googleLogin: () => Promise<void>;
  anonymousLogin: () => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  initialize: (): void => {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          user_id: firebaseUser.uid,
          user_name: firebaseUser.isAnonymous
            ? getAnonymousUserName(firebaseUser.uid)
            : firebaseUser.displayName || "",
          photo_url: firebaseUser.photoURL || "",
          messaging_token: "", // TODO: get FCM token
        };
        set({ user, isLoading: false, error: null });
      } else {
        set({ user: null, isLoading: false, error: null });
      }
    });
  },

  googleLogin: async (): Promise<void> => {
    try {
      set({ isLoading: true, error: null });
      const result = await signInWithPopup(auth, provider);
      const user: User = {
        user_id: result.user.uid,
        user_name: result.user.displayName || "",
        photo_url: result.user.photoURL || "",
        messaging_token: "", // TODO: get FCM token
      };
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  anonymousLogin: async (): Promise<void> => {
    try {
      set({ isLoading: true, error: null });
      const result = await signInAnonymously(auth);
      const user: User = {
        user_id: result.user.uid,
        user_name: getAnonymousUserName(result.user.uid),
        photo_url: "",
        messaging_token: "", // TODO: get FCM token
      };
      set({ user, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      set({ isLoading: true, error: null });
      await signOut(auth);
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
}));

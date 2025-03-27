import { User } from "@/types/chatroom";

export const getAnonymousUserName = (uid: string): string => {
  return `Anonymous_${uid.slice(0, 6)}`;
};

export const isAnonymousUser = (user: User | null): boolean => {
  return user?.user_name === getAnonymousUserName(user?.user_id || "");
};

export const getAnonymousUserName = (uid: string): string => {
  return `Anonymous_${uid.slice(0, 6)}`;
};

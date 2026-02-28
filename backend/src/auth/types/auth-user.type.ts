export type AuthUser = {
  id: number;
  email: string;
  systemRole: {
    id: number;
    name: string;
  };
};

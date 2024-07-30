export interface User {
  id: number;
  name: string;
  email: string;
  password: string; // idealmente, você não armazenaria a senha em plain text
  created_at: Date;
  updated_at: Date;
}

export type UserWithoutPassword = Omit<User, 'password'>;

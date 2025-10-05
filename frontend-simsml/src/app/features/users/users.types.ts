export interface User {
  userId: number;
  identityDoc: string;
  phone?: string;
  address: string;
  name: string;
  paternalSurname: string;
  maternalSurname?: string;
  email: string;
  username: string;
  password?: string;
  isEnabled: boolean;
  accountNoLocked: boolean;
  role: string[];
}

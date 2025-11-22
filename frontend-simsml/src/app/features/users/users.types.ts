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
  isEnabled: boolean;
  accountNoLocked: boolean;
  roles: string[];
}


export interface UserSummary {
  userId: number;
  name: string;
  paternalSurname: string;
  username: string;
}
export interface CreateUserRequest {
  identityDoc: string;
  phone: string;
  address?: string | null;
  name: string;
  paternalSurname: string;
  maternalSurname?: string | null;
  email: string;
  username: string;
  roles: string[];
}

export interface UpdateUserRequest {
  userId: number; 
  identityDoc: string;
  phone: string;
  address?: string | null;
  name: string;
  paternalSurname: string;
  maternalSurname?: string | null;
  email: string;
  username: string;
  isEnabled: boolean; 
  accountNoLocked: boolean;
  roles: string[];
}

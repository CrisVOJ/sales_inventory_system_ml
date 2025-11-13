export interface Customer {
    customerId: number;
    identityDocument?: string;
    phone?: string;
    address?: string;
    name: string;
    paternalSurname: string;
    maternalSurname?: string;
    active: boolean;
}

export interface CustomerSummary {
    customerId: number;
    identityDocument?: string;
    name: string;
    paternalSurname: string;
    maternalSurname?: string;
}

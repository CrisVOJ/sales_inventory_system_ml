import { CustomerSummary } from "../customers/customers.types";
import { UserSummary } from "../users/users.types";
import { SaleItem } from "./sale-details/sale-details.types";
import { SaleStatusSummary } from "./sale-statuses/sale-statuses.types";

export interface Sale {
    saleId: number;
    registrationDate: string;
    user: UserSummary;
    customer: CustomerSummary;
    saleStatus: SaleStatusSummary;
    total?: number;
    saleItems?: SaleItem[];
}

export interface SaleSummary {
    saleId: number;
    registrationDate: string;
    customer: CustomerSummary;
    saleStatus: SaleStatusSummary;
}

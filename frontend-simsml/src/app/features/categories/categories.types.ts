export interface Category {
    categoryId: number;
    name: string;
    description?: string;
    active: boolean;
}

export interface CategorySummary {
    categoryId: number;
    name: string;
}
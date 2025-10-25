import { Injectable } from "@angular/core";
import { BaseCrudService } from "../../shared/base-crud.service";
import { Product } from "./products.types";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: 'root' })
export class ProductsService extends BaseCrudService<Product> {

    constructor(http: HttpClient) {
        super(http, environment.apiUrl + 'product');
    }

    protected override normalize(p: any): Product {
        return {
            productId: p.productId ?? p.id ?? p.product_id,
            name: p.name ?? '',
            description: p.description ?? '',
            code: p.code ?? '',
            suggestedPrice: p.suggestedPrice ?? p.suggested_price ?? '',
            active: typeof p.active === 'boolean' ? p.active : !!p.active,
            categories: Array.isArray(p.categories) ? p.categories
                : Array.isArray(p.categories) ? p.categories
                : (p.categories ? [p.categories] : []),
            unit: p.unit ?? null
        }
    }
}
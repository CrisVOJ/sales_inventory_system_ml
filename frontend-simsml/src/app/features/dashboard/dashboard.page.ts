import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { PredictionChartComponent } from "../predictions/prediction-chart/prediction-chart.component";
import { DataTableComponent, CrudColumn } from "../../shared/data-table/data-table.component";
import { Inventory } from "../inventories/inventories.types";
import { Sale } from "../sales/sales.types";
import { InventoriesService } from "../inventories/inventories.service";
import { SalesService } from "../sales/sales.service";

@Component({
  selector: 'dashboard-page',
  standalone: true,
  templateUrl: './dashboard.page.html',
  imports: [
    CommonModule,
    PredictionChartComponent,
    DataTableComponent
  ],
  styles: [`
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .dashboard__header h1 {
    margin: 0;
    font-size: var(--h2, 1.6rem);
    color: var(--txt-1, #e5e7eb);
  }

  .dashboard__header .subtitle {
    margin: .2rem 0 0;
    color: #9ca3af;
    font-size: .9rem;
  }

  .dashboard__top {
    display: grid;
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1.5fr);
    gap: 1.25rem;
    align-items: stretch;
  }

  .dashboard__chart-card {
    min-height: 360px;
  }

  .dashboard__side-card,
  .dashboard__full-card {
    background: var(--bg-2, #111827);
    border-radius: .75rem;
    padding: 1rem 1.25rem;
    box-shadow: 0 0 0 1px rgba(255,255,255,.03);
  }

  .dashboard__side-card {
    display: flex;
    flex-direction: column;
  }

  .card-header {
    margin-bottom: .75rem;
  }

  .card-header h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--txt-1, #e5e7eb);
  }

  .dashboard__bottom {
    display: block;
  }

  .side-table-wrapper {
    flex: 1;
    max-height: 420px;
    overflow: auto;
  }

  .side-table-wrapper ::ng-deep th {
    white-space: nowrap;
  }

  @media (max-width: 1024px) {
    .dashboard__top {
      grid-template-columns: 1fr;
    }

    .dashboard__chart-card {
      order: 1;
    }

    .dashboard__side-card {
      order: 2;
    }

    .side-table-wrapper {
      max-height: none;
    }
  }
`]


})
export class DashboardPage {
  inventoryCols: CrudColumn<Inventory>[] = [
    {
        key: 'location',
        header: 'Ubicación',
        format: (i) => i.location?.name ?? ''
    },
    {
        key: 'product',
        header: 'Producto',
        format: (i) => i.product?.name ?? ''
    },
    {
        key: 'minimumStock',
        header: 'Stock mín.',
        format: (i) => String(i.minimumStock ?? 0)
    },
    {
        key: 'currentStock',
        header: 'Stock actual',
        format: (i) => String(i.currentStock ?? 0)
    }
  ];


  inventoryRows: Inventory[] = [];
  inventoryTotal = 0;
  inventoryPage = 1;
  inventoryPageSize = 5;
  inventoryQuery = '';

  salesCols: CrudColumn<Sale>[] = [
    {
      key: 'registrationDate',
      header: 'Fecha',
      format: (s) => s.registrationDate
        ? new Date(s.registrationDate).toLocaleDateString()
        : ''
    },
    {
      key: 'customer',
      header: 'Cliente',
      format: (s) => s.customer?.name ?? ''
    },
    {
      key: 'user',
      header: 'Usuario',
      format: (s) => s.user?.username ?? ''
    },
    {
      key: 'saleStatus',
      header: 'Estado',
      format: (s) => s.saleStatus?.name ?? ''
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      format: (s) => s.total != null ? s.total.toFixed(2) : '0.00'
    }
  ];

  salesRows: Sale[] = [];
  salesTotal = 0;
  salesPage = 1;
  salesPageSize = 5;
  salesQuery = '';

  constructor(
    private inventoriesService: InventoriesService,
    private salesService: SalesService
  ) {
    this.loadInventories();
    this.loadSales();
  }

  loadInventories() {
    this.inventoriesService.inventoryWithLessStock().subscribe(r => {
      this.inventoryRows = r;
    });
  }

  searchInventories(q: string) {
    this.inventoryQuery = q;
    this.inventoryPage = 1;
    this.loadInventories();
  }

  paginateInventories(p: { page: number; pageSize: number }) {
    this.inventoryPage = p.page;
    this.inventoryPageSize = p.pageSize;
    this.loadInventories();
  }

  loadSales() {
    this.salesService.getSalesWithDebt({
      page: this.salesPage,
      size: this.salesPageSize,
    }).subscribe(r => {
      this.salesRows = r.rows;
      this.salesTotal = r.total;
    });
  }

  searchSales(q: string) {
    this.salesQuery = q;
    this.salesPage = 1;
    this.loadSales();
  }

  paginateSales(p: { page: number; pageSize: number }) {
    this.salesPage = p.page;
    this.salesPageSize = p.pageSize;
    this.loadSales();
  }
}

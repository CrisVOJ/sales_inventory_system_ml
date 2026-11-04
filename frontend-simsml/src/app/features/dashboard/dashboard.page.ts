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
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    CommonModule,
    PredictionChartComponent,
    DataTableComponent
  ]
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

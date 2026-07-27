export interface BalanceDto {
  income: number;
  expense: number;
  total: number;
}

export interface ByCategoryDto {
  categoryId: string;
  categoryName: string;
  type: string;
  total: number;
}

export interface BudgetAlertDto {
  budgetId: string;
  categoryName: string;
  percentageUsed: number;
}

export interface DashboardResponse {
  balance: BalanceDto;
  byCategory: ByCategoryDto[];
  budgetAlerts: BudgetAlertDto[];
}

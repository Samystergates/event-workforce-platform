export interface FinanceMatchingSummary {
  confirmedMatches: number;
  suggestedMatches: number;
  multiInvoiceMatches: number;
  errors: number;
}

export interface FinanceManualMatchRequest {
  transactionId: number;
  invoiceId: number;
  notes?: string;
}

export interface FinanceMatchResponse {
  matchId: number;
  confidence: number;
  status: string;
}

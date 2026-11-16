export interface FinanceBankImportResponse {
  fileName: string;
  transactionsParsed: number;
  transactionsSaved: number;
  duplicatesSkipped: number;
}

export interface FinanceBankTransaction {
  id: number;
  transactionId: string;
  bookingDate: string;
  valueDate?: string | null;
  amount: number;
  currency?: string | null;
  debtorName?: string | null;
  debtorIban?: string | null;
  creditorName?: string | null;
  creditorIban?: string | null;
  description?: string | null;
  remittanceInfo?: string | null;
  endToEndId?: string | null;
  mandateId?: string | null;
  camtFileName?: string | null;
  importedAt?: string | null;
  isMatched?: boolean | null;
  matchConfidence?: number | null;
}

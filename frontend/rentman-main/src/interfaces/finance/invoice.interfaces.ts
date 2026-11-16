export interface FinanceInvoiceLine {
  id?: number;
  description?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  vatPercentage?: number | null;
  amountExclVat?: number | null;
  vatAmount?: number | null;
  amountInclVat?: number | null;
}

export interface FinanceMatchRecord {
  id: number;
  invoiceId: number | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  invoiceAmount: number | null;
  transactionId: number | null;
  transactionReference: string | null;
  transactionBookingDate: string | null;
  transactionAmount: number | null;
  matchStatus: string | null;
  matchType: string | null;
  confidenceScore: number | null;
  matchedOnAmount?: boolean | null;
  matchedOnIban?: boolean | null;
  matchedOnReference?: boolean | null;
  matchedOnDateRange?: boolean | null;
  matchedAmount?: number | null;
  partialPayment?: boolean | null;
  paymentGroupId?: string | null;
  confirmedByUser?: string | null;
  confirmedAt?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface FinanceInvoiceSummary {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  supplierName: string;
  amountInclVat: number | null;
  isValid?: boolean | null;
  isMatched?: boolean | null;
  extractionConfidence?: number | null;
  extractionMethod?: string | null;
  emailFolder?: string | null;
  originalFilename?: string | null;
  importedAt?: string | null;
}

export interface FinanceInvoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceType?: string;
  supplierName: string;
  supplierAddress?: string | null;
  supplierPostalCode?: string | null;
  supplierCity?: string | null;
  supplierCountry?: string | null;
  supplierVatNumber?: string | null;
  supplierKvkNumber?: string | null;
  customerName?: string | null;
  customerAddress?: string | null;
  customerPostalCode?: string | null;
  customerCity?: string | null;
  customerCountry?: string | null;
  customerVatNumber?: string | null;
  customerReference?: string | null;
  amountExclVat?: number | null;
  vatAmount?: number | null;
  amountInclVat?: number | null;
  currency?: string | null;
  vatPercentage?: number | null;
  vatReverseCharge?: boolean | null;
  vatSpecification?: string | null;
  supplierIban?: string | null;
  supplierBic?: string | null;
  paymentTerms?: string | null;
  dueDate?: string | null;
  paymentReference?: string | null;
  pdfFilePath: string;
  pdfFileHash: string;
  pdfTextContent?: string | null;
  emailMessageId?: string | null;
  emailFolder?: string | null;
  emailSender?: string | null;
  originalFilename?: string | null;
  extractionConfidence?: number | null;
  extractionMethod?: string | null;
  typeDetectionMethod?: string | null;
  extractionWarnings?: string | null;
  validationErrors?: string | null;
  missingRequiredFields?: string | null;
  isValid?: boolean | null;
  isMatched?: boolean | null;
  isPaid?: boolean | null;
  importedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  descriptionSummary?: string | null;
  servicePeriodStart?: string | null;
  servicePeriodEnd?: string | null;
  purchaseOrderNumber?: string | null;
  projectReference?: string | null;
  invoiceLines: FinanceInvoiceLine[];
  matches: FinanceMatchRecord[];
}

export interface FinanceEmailFetchRequest {
  emailAddress: string;
  daysBack?: number;
  folderPath?: string;
}

export interface FinanceEmailFetchResponse {
  attachmentsFound: number;
  attachmentsProcessed: number;
  failures: string[];
}

export interface FinanceInvoiceUploadResponse {
  invoiceId: number;
  valid: boolean;
  errors: string[];
  warnings: string[];
  extractionConfidence?: number | null;
}

export interface FinanceInvoiceUpdateRequest {
  isValid?: boolean;
  isMatched?: boolean;
  isPaid?: boolean;
  supplierName?: string;
  supplierAddress?: string;
  supplierPostalCode?: string;
  supplierCity?: string;
  supplierCountry?: string;
  supplierVatNumber?: string;
  supplierKvkNumber?: string;
  customerName?: string;
  customerAddress?: string;
  customerPostalCode?: string;
  customerCity?: string;
  customerCountry?: string;
  customerVatNumber?: string;
  amountExclVat?: number;
  vatAmount?: number;
  amountInclVat?: number;
  currency?: string;
  vatPercentage?: number;
  vatReverseCharge?: boolean;
  vatSpecification?: string;
  supplierIban?: string;
  supplierBic?: string;
  paymentTerms?: string;
  dueDate?: string;
  paymentReference?: string;
  descriptionSummary?: string;
  servicePeriodStart?: string;
  servicePeriodEnd?: string;
  purchaseOrderNumber?: string;
  projectReference?: string;
  extractionConfidence?: number;
  extractionMethod?: string;
  typeDetectionMethod?: string;
  extractionWarnings?: string;
  validationErrors?: string;
  missingRequiredFields?: string;
}

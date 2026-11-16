import { financeAxios } from "@/lib/financeClient";
import {
  FinanceEmailFetchRequest,
  FinanceEmailFetchResponse,
  FinanceInvoice,
  FinanceInvoiceSummary,
  FinanceInvoiceUpdateRequest,
  FinanceInvoiceUploadResponse,
} from "@/interfaces/finance/invoice.interfaces";

const INVOICE_BASE = "/api/v1/invoices";

export async function triggerFinanceEmailFetch(
  payload: FinanceEmailFetchRequest
) {
  const response = await financeAxios.post<FinanceEmailFetchResponse>(
    `${INVOICE_BASE}/fetch-from-email`,
    payload
  );
  return response.data;
}

export async function uploadFinanceInvoice(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await financeAxios.post<FinanceInvoiceUploadResponse>(
    `${INVOICE_BASE}/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data;
}

export async function listFinanceInvoices(params?: {
  isValid?: boolean;
  isMatched?: boolean;
  supplierName?: string;
}) {
  const response = await financeAxios.get<FinanceInvoiceSummary[]>(INVOICE_BASE, {
    params,
  });
  if (!Array.isArray(response.data)) {
    throw new Error("Unexpected invoice list response");
  }
  return response.data;
}

export async function getFinanceInvoice(id: number) {
  const response = await financeAxios.get<FinanceInvoice>(`${INVOICE_BASE}/${id}`);
  return response.data;
}

export async function updateFinanceInvoice(
  id: number,
  payload: FinanceInvoiceUpdateRequest
) {
  const response = await financeAxios.put<FinanceInvoice>(
    `${INVOICE_BASE}/${id}`,
    payload
  );
  return response.data;
}

export async function deleteFinanceInvoice(id: number) {
  await financeAxios.delete(`${INVOICE_BASE}/${id}`);
}

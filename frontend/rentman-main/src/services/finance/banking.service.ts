import { financeAxios } from "@/lib/financeClient";
import { appLogger } from "@/lib/logger";
import {
  FinanceBankImportResponse,
  FinanceBankTransaction,
} from "@/interfaces/finance/bank.interfaces";

const BANK_BASE = "/api/v1/bank";

export async function uploadFinanceCamt(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  appLogger.info("[finance] uploadFinanceCamt start", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  try {
    const response = await financeAxios.post<FinanceBankImportResponse>(
      `${BANK_BASE}/upload-camt`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    appLogger.info("[finance] uploadFinanceCamt response", response.status, response.data);

    if (!response.data || typeof response.data !== "object") {
      throw new Error("Unexpected bank import response");
    }
    return response.data;
  } catch (error) {
    appLogger.error("[finance] uploadFinanceCamt error", error);
    throw error;
  }
}

export async function uploadFinanceMt940(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  appLogger.info("[finance] uploadFinanceMt940 start", {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  try {
    const response = await financeAxios.post<FinanceBankImportResponse>(
      `${BANK_BASE}/upload-mt940`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    appLogger.info("[finance] uploadFinanceMt940 response", response.status, response.data);

    if (!response.data || typeof response.data !== "object") {
      throw new Error("Unexpected bank import response");
    }
    return response.data;
  } catch (error) {
    appLogger.error("[finance] uploadFinanceMt940 error", error);
    throw error;
  }
}

export async function listFinanceBankTransactions() {
  const response = await financeAxios.get<FinanceBankTransaction[]>(
    `${BANK_BASE}/transactions`
  );
  if (!Array.isArray(response.data)) {
    throw new Error("Unexpected transactions response");
  }
  return response.data;
}

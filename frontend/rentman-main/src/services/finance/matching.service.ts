import { financeAxios } from "@/lib/financeClient";
import {
  FinanceManualMatchRequest,
  FinanceMatchResponse,
  FinanceMatchingSummary,
} from "@/interfaces/finance/matching.interfaces";
import { FinanceMatchRecord } from "@/interfaces/finance/invoice.interfaces";

const MATCHING_BASE = "/api/v1/matching";

export async function runFinanceAutoMatching() {
  const response = await financeAxios.post<FinanceMatchingSummary>(
    `${MATCHING_BASE}/auto`
  );
  return response.data;
}

export async function submitFinanceManualMatch(
  payload: FinanceManualMatchRequest
) {
  const response = await financeAxios.post<FinanceMatchResponse>(
    `${MATCHING_BASE}/manual`,
    payload
  );
  return response.data;
}

export async function listFinanceMatches(invoiceId: number) {
  const response = await financeAxios.get<FinanceMatchRecord[]>(
    `${MATCHING_BASE}/invoice/${invoiceId}`
  );
  return response.data;
}

export async function confirmFinanceMatch(matchId: number) {
  const response = await financeAxios.put<FinanceMatchRecord>(
    `${MATCHING_BASE}/${matchId}/confirm`
  );
  return response.data;
}

export async function rejectFinanceMatch(matchId: number) {
  const response = await financeAxios.put<FinanceMatchRecord>(
    `${MATCHING_BASE}/${matchId}/reject`
  );
  return response.data;
}

export async function deleteFinanceMatch(matchId: number) {
  await financeAxios.delete(`${MATCHING_BASE}/${matchId}`);
}

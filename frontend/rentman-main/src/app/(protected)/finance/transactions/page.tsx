"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { appLogger } from "@/lib/logger";
import {
  listFinanceBankTransactions,
  uploadFinanceCamt,
  uploadFinanceMt940,
} from "@/services/finance/banking.service";
import { FinanceBankTransaction } from "@/interfaces/finance/bank.interfaces";
import { IconsComponent } from "@/components/common/icons.component";

const amountFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

export default function FinanceTransactionsPage() {
  const { toast } = useToast();
  const camtInputRef = useRef<HTMLInputElement | null>(null);
  const mt940InputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<FinanceBankTransaction[]>([]);
  const [uploadingType, setUploadingType] = useState<"camt" | "mt940" | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listFinanceBankTransactions();
      if (Array.isArray(data)) {
        setTransactions(data);
      } else {
        setTransactions([]);
        toast({
          title: "Onverwachte serverrespons",
          description: "Transacties konden niet geladen worden.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Kon transacties niet laden",
        description: "Controleer de verbinding met de finance-API.",
        variant: "destructive",
      });
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleUpload = async (file: File | null, type: "camt" | "mt940") => {
    if (!file) return;
    appLogger.info("[finance] handleUpload → start", {
      type,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    setUploadingType(type);
    try {
      const response =
        type === "camt" ? await uploadFinanceCamt(file) : await uploadFinanceMt940(file);
      appLogger.info("[finance] handleUpload → success", response);
      toast({
        title: "Bestand verwerkt",
        description: `${response.transactionsSaved}/${response.transactionsParsed} transacties opgeslagen (${response.duplicatesSkipped} duplicaten overgeslagen).`,
      });
      await loadTransactions();
    } catch (error) {
      appLogger.error("[finance] handleUpload → error", error);
      toast({
        title: "Upload mislukt",
        description: "Het bestand kon niet worden verwerkt.",
        variant: "destructive",
      });
    } finally {
      appLogger.info("[finance] handleUpload → finished", { type });
      setUploadingType(null);
      if (type === "mt940" && mt940InputRef.current) {
        mt940InputRef.current.value = "";
      }
    }
  };

  const unmatchedCount = transactions.filter((tx) => !tx.isMatched).length;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Banktransacties</h1>
        <p className="text-sm text-muted-foreground">
          Upload CAMT/MT940-bestanden en volg de matchingstatus van transacties.
        </p>
      </header>

      <section className="rounded-md border p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => camtInputRef.current?.click()}
              disabled={uploadingType === "camt"}
            >
              {uploadingType === "camt" && (
                <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload CAMT-053
            </Button>
            <input
              ref={camtInputRef}
              type="file"
              accept=".xml"
              className="hidden"
              onChange={(event) => handleUpload(event.target.files?.[0] ?? null, "camt")}
            />

            <Button
              variant="outline"
              onClick={() => mt940InputRef.current?.click()}
              disabled={uploadingType === "mt940"}
            >
              {uploadingType === "mt940" && (
                <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload MT940
            </Button>
            <input
              ref={mt940InputRef}
              type="file"
              accept=".txt,.mt940"
              className="hidden"
              onChange={(event) => handleUpload(event.target.files?.[0] ?? null, "mt940")}
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={unmatchedCount === 0 ? "secondary" : "destructive"}>
              {unmatchedCount} openstaand
            </Badge>
            <Button variant="outline" onClick={loadTransactions} disabled={loading}>
              {loading && <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Vernieuwen
            </Button>
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-md border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Referentie
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Datum
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Bedrag
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Tegenpartij
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  <IconsComponent.spinner className="mr-2 inline h-4 w-4 animate-spin" />
                  Transacties laden...
                </td>
              </tr>
            ) : !Array.isArray(transactions) || transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Nog geen transacties geimporteerd.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-3 text-sm font-medium">
                    {tx.endToEndId ?? tx.transactionId}
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDate(tx.bookingDate)}</td>
                  <td className="px-4 py-3 text-sm">
                    {amountFormatter.format(tx.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {tx.debtorName || tx.creditorName || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={tx.isMatched ? "secondary" : "outline"}>
                      {tx.isMatched ? `Gematcht (${tx.matchConfidence != null ? Math.round(tx.matchConfidence * 100) + "%" : "100%"})` : "Openstaand"}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

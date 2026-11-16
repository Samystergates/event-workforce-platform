"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  runFinanceAutoMatching,
  submitFinanceManualMatch,
} from "@/services/finance/matching.service";
import { listFinanceInvoices } from "@/services/finance/invoices.service";
import {
  listFinanceBankTransactions,
} from "@/services/finance/banking.service";
import {
  FinanceInvoiceSummary,
} from "@/interfaces/finance/invoice.interfaces";
import {
  FinanceBankTransaction,
} from "@/interfaces/finance/bank.interfaces";
import {
  FinanceMatchingSummary,
} from "@/interfaces/finance/matching.interfaces";
import { IconsComponent } from "@/components/common/icons.component";

export default function FinanceMatchesPage() {
  const { toast } = useToast();
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoResult, setAutoResult] = useState<FinanceMatchingSummary | null>(null);

  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const [invoices, setInvoices] = useState<FinanceInvoiceSummary[]>([]);
  const [transactions, setTransactions] = useState<FinanceBankTransaction[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [invoiceData, transactionData] = await Promise.all([
          listFinanceInvoices().catch(() => null),
          listFinanceBankTransactions().catch(() => null),
        ]);

        if (Array.isArray(invoiceData)) {
          setInvoices(invoiceData);
        } else {
          setInvoices([]);
        }

        if (Array.isArray(transactionData)) {
          setTransactions(transactionData);
        } else {
          setTransactions([]);
        }

        if (!Array.isArray(invoiceData) || !Array.isArray(transactionData)) {
          toast({
            title: "Onverwachte serverrespons",
            description: "Gegevens konden niet volledig geladen worden.",
            variant: "destructive",
          });
        }
      } catch {
        setInvoices([]);
        setTransactions([]);
        toast({
          title: "Kon gegevens niet laden",
          description: "Facturen of transacties konden niet worden opgehaald.",
          variant: "destructive",
        });
      }
    };
    load();
  }, [toast]);
  const handleAutoMatch = async () => {
    setAutoLoading(true);
    try {
      const summary = await runFinanceAutoMatching();
      setAutoResult(summary);
      toast({ title: "Automatische matching uitgevoerd" });
    } catch {
      toast({
        title: "Automatische matching mislukt",
        description: "Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setAutoLoading(false);
    }
  };

  const handleManualSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!invoiceId || !transactionId) {
      toast({
        title: "Selecteer factuur en transactie",
        description: "Beide velden zijn verplicht voor een handmatige match.",
        variant: "destructive",
      });
      return;
    }
    setManualSubmitting(true);
    try {
      await submitFinanceManualMatch({
        invoiceId: Number(invoiceId),
        transactionId: Number(transactionId),
        notes: notes.trim() || undefined,
      });
      toast({ title: "Match aangemaakt" });
      setInvoiceId("");
      setTransactionId("");
      setNotes("");
    } catch {
      toast({
        title: "Handmatige match mislukt",
        description: "Controleer de invoer en probeer opnieuw.",
        variant: "destructive",
      });
    } finally {
      setManualSubmitting(false);
    }
  };

  const unmatchedTransactions = useMemo(
    () => (Array.isArray(transactions) ? transactions.filter((tx) => !tx.isMatched) : []),
    [transactions]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Matching</h1>
        <p className="text-sm text-muted-foreground">
          Automatiseer of voer handmatige matches uit tussen banktransacties en facturen.
        </p>
      </header>

      <section className="space-y-4 rounded-md border p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Automatische matching</h2>
            <p className="text-sm text-muted-foreground">
              De matcher doorloopt alle openstaande facturen en transacties en past dezelfde regels toe
              als in Eventico-creditors.
            </p>
          </div>
          <Button onClick={handleAutoMatch} disabled={autoLoading}>
            {autoLoading && <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Start matching
          </Button>
        </div>
        {autoResult ? (
          <div className="grid gap-3 rounded-md border bg-muted/40 p-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs uppercase text-muted-foreground">Bevestigd</p>
              <p className="text-lg font-semibold">{autoResult.confirmedMatches}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-muted-foreground">Voorgesteld</p>
              <p className="text-lg font-semibold">{autoResult.suggestedMatches}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-muted-foreground">Multi facturen</p>
              <p className="text-lg font-semibold">{autoResult.multiInvoiceMatches}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase text-muted-foreground">Fouten</p>
              <p className="text-lg font-semibold">{autoResult.errors}</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-md border p-4">
        <div>
          <h2 className="text-lg font-semibold">Handmatige match</h2>
          <p className="text-sm text-muted-foreground">
            Koppel een specifieke transactie aan een factuur. Gebruik dit wanneer automatische matching
            onvoldoende informatie heeft.
          </p>
        </div>
        <form onSubmit={handleManualSubmit} className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Factuur</label>
            <Select value={invoiceId} onValueChange={setInvoiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer factuur" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {Array.isArray(invoices) && invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <SelectItem key={invoice.id} value={String(invoice.id)}>
                      {invoice.invoiceNumber} - {invoice.supplierName || "Onbekend"}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="__no_invoices">
                    Geen facturen beschikbaar
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Transactie</label>
            <Select value={transactionId} onValueChange={setTransactionId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer transactie" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {Array.isArray(unmatchedTransactions) && unmatchedTransactions.length > 0 ? (
                  unmatchedTransactions.map((tx) => (
                    <SelectItem key={tx.id} value={String(tx.id)}>
                      {tx.endToEndId ?? tx.transactionId} - {tx.debtorName || tx.creditorName || "Onbekend"}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="__no_transactions">
                    Geen transacties beschikbaar
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-3">
            <label className="text-sm font-medium">Notities (optioneel)</label>
            <Input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Opmerkingen over deze match"
            />
          </div>
          <div className="md:col-span-3">
            <Button type="submit" disabled={manualSubmitting}>
              {manualSubmitting && <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Opslaan
            </Button>
          </div>
        </form>
        <div className="text-sm text-muted-foreground">
          {unmatchedTransactions.length === 0 ? (
            <p>Er zijn momenteel geen onbemande transacties.</p>
          ) : (
            <p>{unmatchedTransactions.length} transactie(s) wachten nog op matching.</p>
          )}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FinanceEmailFetchRequest,
  FinanceInvoice,
  FinanceInvoiceSummary,
  FinanceInvoiceUpdateRequest,
} from "@/interfaces/finance/invoice.interfaces";
import {
  deleteFinanceInvoice,
  getFinanceInvoice,
  listFinanceInvoices,
  triggerFinanceEmailFetch,
  updateFinanceInvoice,
  uploadFinanceInvoice,
} from "@/services/finance/invoices.service";
import {
  confirmFinanceMatch,
  deleteFinanceMatch,
  rejectFinanceMatch,
} from "@/services/finance/matching.service";
import { FinanceMatchRecord } from "@/interfaces/finance/invoice.interfaces";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { IconsComponent } from "@/components/common/icons.component";

 type FilterState = {
  validity: "all" | "valid" | "invalid";
  matched: "all" | "matched" | "unmatched";
  supplier: string;
 };

const initialFilters: FilterState = {
  validity: "all",
  matched: "all",
  supplier: "",
};

const formatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("nl-NL", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : dateFormatter.format(d);
}

function formatAmount(value?: number | null) {
  if (value === undefined || value === null) return "—";
  return formatter.format(value);
}

export default function FinanceInvoicesPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [loading, setLoading] = useState<boolean>(false);
  const [invoices, setInvoices] = useState<FinanceInvoiceSummary[]>([]);

  const [emailDialogOpen, setEmailDialogOpen] = useState<boolean>(false);
  const [emailForm, setEmailForm] = useState<FinanceEmailFetchRequest>({
    emailAddress: "",
    daysBack: 30,
    folderPath: "",
  });
  const [emailSubmitting, setEmailSubmitting] = useState<boolean>(false);

  const [uploading, setUploading] = useState<boolean>(false);

  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FinanceInvoice | null>(null);
  const [matchUpdating, setMatchUpdating] = useState<number | null>(null);
  const [updatingInvoice, setUpdatingInvoice] = useState<boolean>(false);
  const [deletingInvoice, setDeletingInvoice] = useState<boolean>(false);

  const invoiceLines = selectedInvoice && Array.isArray(selectedInvoice.invoiceLines) ? selectedInvoice.invoiceLines : [];
  const matches = selectedInvoice && Array.isArray(selectedInvoice.matches) ? selectedInvoice.matches : [];
  useEffect(() => {
    if (!detailOpen) {
      setSelectedInvoice(null);
    }
  }, [detailOpen]);
  const queryParams = useMemo(() => {
    const params: Record<string, string | boolean> = {};
    if (filters.validity !== "all") {
      params.isValid = filters.validity === "valid";
    }
    if (filters.matched !== "all") {
      params.isMatched = filters.matched === "matched";
    }
    if (filters.supplier.trim()) {
      params.supplierName = filters.supplier.trim();
    }
    return params;
  }, [filters]);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listFinanceInvoices(queryParams);
      if (Array.isArray(data)) {
        setInvoices(data);
      } else {
        setInvoices([]);
        toast({
          title: "Onverwachte serverrespons",
          description: "De finance API gaf geen lijst terug.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Kon facturen niet laden",
        description: "Controleer de verbinding met de finance-API.",
        variant: "destructive",
      });
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [queryParams, toast]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);
  const openDetail = useCallback(
    async (invoiceId: number) => {
      setDetailLoading(true);
      setDetailOpen(true);
      try {
        const data = await getFinanceInvoice(invoiceId);
        setSelectedInvoice(data);
      } catch (error) {
        toast({
          title: "Kon factuur niet openen",
          description: "De geselecteerde factuur kan niet worden opgehaald.",
          variant: "destructive",
        });
        setDetailOpen(false);
      } finally {
        setDetailLoading(false);
      }
    },
    [toast]
  );

  const refreshDetail = useCallback(async () => {
    if (!selectedInvoice) return;
    try {
      const data = await getFinanceInvoice(selectedInvoice.id);
      setSelectedInvoice(data);
    } catch {
      toast({
        title: "Bijwerken mislukt",
        description: "De actuele factuurgegevens konden niet worden opgehaald.",
        variant: "destructive",
      });
    }
  }, [selectedInvoice, toast]);

  const handleInvoiceUpdate = useCallback(
    async (payload: FinanceInvoiceUpdateRequest) => {
      if (!selectedInvoice) return;
      setUpdatingInvoice(true);
      try {
        const updated = await updateFinanceInvoice(selectedInvoice.id, payload);
        setSelectedInvoice(updated);
        await loadInvoices();
        toast({
          title: "Factuur bijgewerkt",
          description: "De wijzigingen zijn opgeslagen.",
        });
      } catch {
        toast({
          title: "Bijwerken mislukt",
          description: "Probeer het opnieuw of controleer de invoer.",
          variant: "destructive",
        });
      } finally {
        setUpdatingInvoice(false);
      }
    },
    [selectedInvoice, loadInvoices, toast]
  );

  const handleInvoiceDelete = useCallback(async () => {
    if (!selectedInvoice) return;
    if (!window.confirm("Weet je zeker dat je deze factuur wilt verwijderen?")) return;
    setDeletingInvoice(true);
    try {
      await deleteFinanceInvoice(selectedInvoice.id);
      toast({ title: "Factuur verwijderd" });
      setDetailOpen(false);
      setSelectedInvoice(null);
      await loadInvoices();
    } catch {
      toast({
        title: "Verwijderen mislukt",
        description: "De factuur kon niet worden verwijderd.",
        variant: "destructive",
      });
    } finally {
      setDeletingInvoice(false);
    }
  }, [selectedInvoice, toast, loadInvoices]);

  const handleMatchAction = useCallback(
    async (id: number, action: "confirm" | "reject" | "delete") => {
      if (!selectedInvoice) return;
      if (action === "delete" && !window.confirm("Weet je zeker dat je deze match wilt verwijderen?")) {
        return;
      }
      setMatchUpdating(id);
      try {
        if (action === "confirm") {
          await confirmFinanceMatch(id);
        } else if (action === "reject") {
          await rejectFinanceMatch(id);
        } else {
          await deleteFinanceMatch(id);
        }
        await refreshDetail();
        await loadInvoices();
        toast({
          title: action === "delete" ? "Match verwijderd" : "Match bijgewerkt",
        });
      } catch {
        toast({
          title: "Matchactie mislukt",
          description: "Kon de match niet bijwerken.",
          variant: "destructive",
        });
      } finally {
        setMatchUpdating(null);
      }
    },
    [selectedInvoice, refreshDetail, loadInvoices, toast]
  );
  const handleEmailFetch = useCallback(async () => {
    if (!emailForm.emailAddress.trim()) {
      toast({
        title: "E-mailadres verplicht",
        description: "Voer een mailbox in om e-mails op te halen.",
        variant: "destructive",
      });
      return;
    }
    setEmailSubmitting(true);
    try {
      const payload: FinanceEmailFetchRequest = {
        emailAddress: emailForm.emailAddress.trim(),
        daysBack: emailForm.daysBack,
        folderPath: emailForm.folderPath?.trim() || undefined,
      };
      const result = await triggerFinanceEmailFetch(payload);
      toast({
        title: "E-mail synchronisatie gestart",
        description: `${result.attachmentsProcessed}/${result.attachmentsFound} bijlagen verwerkt.`,
      });
      setEmailDialogOpen(false);
      await loadInvoices();
    } catch {
      toast({
        title: "Synchronisatie mislukt",
        description: "Controleer de instellingen en probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setEmailSubmitting(false);
    }
  }, [emailForm, loadInvoices, toast]);

  const handleFileUpload = useCallback(
    async (file?: File | null) => {
      if (!file) return;
      setUploading(true);
      try {
        const response = await uploadFinanceInvoice(file);
        toast({
          title: "Factuur geupload",
          description: response.valid
            ? "Factuur is succesvol gevalideerd."
            : "Factuur opgeslagen met waarschuwingen.",
        });
        await loadInvoices();
      } catch {
        toast({
          title: "Upload mislukt",
          description: "Er is iets misgegaan bij het uploaden van het bestand.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [loadInvoices, toast]
  );

  const filteredLabel = useMemo(() => {
    const parts: string[] = [];
    if (filters.validity !== "all") {
      parts.push(filters.validity === "valid" ? "alleen geldig" : "alleen ongeldig");
    }
    if (filters.matched !== "all") {
      parts.push(filters.matched === "matched" ? "alleen gematcht" : "alleen onvergelijk");
    }
    if (filters.supplier.trim()) {
      parts.push(`leverancier bevat "${filters.supplier.trim()}"`);
    }
    return parts.length ? parts.join(" - ") : "Geen filters actief";
  }, [filters]);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Facturen</h1>
          <p className="text-sm text-muted-foreground">
            Beheer e-mail import, uploads, validatie en matchingstatus.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{filteredLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadInvoices} disabled={loading}>
            {loading ? <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" /> : null}
            Vernieuwen
          </Button>
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Ophalen uit mailbox</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Microsoft 365 mailbox</DialogTitle>
                <DialogDescription>
                  Geef het e-mailadres en optioneel een map en periode op om facturen op te halen.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mailbox*</label>
                  <Input
                    value={emailForm.emailAddress}
                    onChange={(event) =>
                      setEmailForm((prev) => ({ ...prev, emailAddress: event.target.value }))
                    }
                    placeholder="invoices@example.test"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dagen terugkijken</label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={emailForm.daysBack ?? 30}
                    onChange={(event) =>
                      setEmailForm((prev) => ({
                        ...prev,
                        daysBack: Number(event.target.value || 30),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Map (optioneel)</label>
                  <Input
                    value={emailForm.folderPath ?? ""}
                    onChange={(event) =>
                      setEmailForm((prev) => ({ ...prev, folderPath: event.target.value }))
                    }
                    placeholder="Inbox/Facturen"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleEmailFetch}
                  disabled={emailSubmitting}
                  className="w-full md:w-auto"
                >
                  {emailSubmitting && (
                    <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Ophalen starten
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative"
          >
            {uploading && <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Upload factuur
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(event) => handleFileUpload(event.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Validatie</label>
          <Select
            value={filters.validity}
            onValueChange={(value: FilterState["validity"]) =>
              setFilters((prev) => ({ ...prev, validity: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter op validatie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="valid">Alleen geldig</SelectItem>
              <SelectItem value="invalid">Alleen ongeldig</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Matching</label>
          <Select
            value={filters.matched}
            onValueChange={(value: FilterState["matched"]) =>
              setFilters((prev) => ({ ...prev, matched: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter op matching" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="matched">Alleen gematcht</SelectItem>
              <SelectItem value="unmatched">Alleen niet gematcht</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Leverancier</label>
          <Input
            placeholder="Zoek op naam"
            value={filters.supplier}
            onChange={(event) => setFilters((prev) => ({ ...prev, supplier: event.target.value }))}
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Factuur
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Leverancier
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Bedrag
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Validatie
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Matching
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                Ingekomen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  <IconsComponent.spinner className="mr-2 inline h-4 w-4 animate-spin" />
                  Facturen laden...
                </td>
              </tr>
            ) : !Array.isArray(invoices) || invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Geen facturen gevonden voor deze filters.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => openDetail(invoice.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(invoice.invoiceDate)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{invoice.supplierName || "—"}</td>
                  <td className="px-4 py-3 text-sm">{formatAmount(invoice.amountInclVat)}</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={invoice.isValid ? "default" : "destructive"}>
                      {invoice.isValid ? "geldig" : "controle nodig"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={invoice.isMatched ? "secondary" : "outline"}>
                      {invoice.isMatched ? "gematcht" : "openstaand"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{formatDate(invoice.importedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedInvoice ? `Factuur ${selectedInvoice.invoiceNumber}` : "Factuurdetails"}
            </DialogTitle>
            <DialogDescription>
              {selectedInvoice
                ? `Ontvangen op ${formatDate(selectedInvoice.importedAt)}`
                : "Detailinformatie over de geselecteerde factuur."}
            </DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />
              Factuur laden...
            </div>
          ) : selectedInvoice ? (
            <div className="space-y-6 overflow-y-auto">
              <section className="grid gap-4 rounded-md border p-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Status</h3>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isValid"
                      checked={Boolean(selectedInvoice.isValid)}
                      onCheckedChange={(checked) =>
                        handleInvoiceUpdate({ isValid: Boolean(checked) })
                      }
                      disabled={updatingInvoice}
                    />
                    <label htmlFor="isValid" className="text-sm">
                      Valide
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isMatched"
                      checked={Boolean(selectedInvoice.isMatched)}
                      onCheckedChange={(checked) =>
                        handleInvoiceUpdate({ isMatched: Boolean(checked) })
                      }
                      disabled={updatingInvoice}
                    />
                    <label htmlFor="isMatched" className="text-sm">
                      Gematcht
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="isPaid"
                      checked={Boolean(selectedInvoice.isPaid)}
                      onCheckedChange={(checked) =>
                        handleInvoiceUpdate({ isPaid: Boolean(checked) })
                      }
                      disabled={updatingInvoice}
                    />
                    <label htmlFor="isPaid" className="text-sm">
                      Betaald
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Bedragen</h3>
                  <p className="text-sm">
                    Excl. btw: <span className="font-medium">{formatAmount(selectedInvoice.amountExclVat)}</span>
                  </p>
                  <p className="text-sm">
                    Btw: <span className="font-medium">{formatAmount(selectedInvoice.vatAmount)}</span>
                  </p>
                  <p className="text-sm">
                    Incl. btw: <span className="font-medium">{formatAmount(selectedInvoice.amountInclVat)}</span>
                  </p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-sm font-semibold">Leverancier</h3>
                  <p className="text-sm">
                    {selectedInvoice.supplierName || "—"}
                    {selectedInvoice.supplierVatNumber ? ` - ${selectedInvoice.supplierVatNumber}` : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[selectedInvoice.supplierAddress, selectedInvoice.supplierPostalCode, selectedInvoice.supplierCity]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-sm font-semibold">Betalingsinformatie</h3>
                  <p className="text-sm">
                    IBAN: <span className="font-medium">{selectedInvoice.supplierIban || "—"}</span>
                  </p>
                  <p className="text-sm">
                    Betalingstermijn: {selectedInvoice.paymentTerms || "—"}
                    {selectedInvoice.dueDate ? ` - Vervaldatum ${formatDate(selectedInvoice.dueDate)}` : ""}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-sm font-semibold">Validatie / AI</h3>
                  <p className="text-sm">
                    Extractiemethode: {selectedInvoice.extractionMethod || "—"} (
                    {selectedInvoice.extractionConfidence != null
                      ? `${Math.round(selectedInvoice.extractionConfidence * 100)}%`
                      : "—"}
                    )
                  </p>
                  {selectedInvoice.extractionWarnings ? (
                    <p className="rounded-md bg-yellow-100 p-2 text-xs text-yellow-900">
                      {selectedInvoice.extractionWarnings}
                    </p>
                  ) : null}
                  {selectedInvoice.validationErrors ? (
                    <p className="rounded-md bg-red-100 p-2 text-xs text-red-900">
                      {selectedInvoice.validationErrors}
                    </p>
                  ) : null}
                  {selectedInvoice.missingRequiredFields ? (
                    <p className="rounded-md bg-orange-100 p-2 text-xs text-orange-900">
                      Ontbrekende velden: {selectedInvoice.missingRequiredFields}
                    </p>
                  ) : null}
                </div>
              </section>
              <section className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Factuurregels</h3>
                  <span className="text-xs text-muted-foreground">
                    {invoiceLines.length} regels
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 text-left">
                        <th className="px-3 py-2 font-medium">Omschrijving</th>
                        <th className="px-3 py-2 font-medium">Aantal</th>
                        <th className="px-3 py-2 font-medium">Prijs</th>
                        <th className="px-3 py-2 font-medium">Totaal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {invoiceLines.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                            Geen regels gevonden.
                          </td>
                        </tr>
                      ) : (
                        invoiceLines.map((line) => (
                          <tr key={line.id ?? `${line.description}-${line.amountInclVat}`}>
                            <td className="px-3 py-2">{line.description || "—"}</td>
                            <td className="px-3 py-2">{line.quantity ?? "—"}</td>
                            <td className="px-3 py-2">{formatAmount(line.unitPrice)}</td>
                            <td className="px-3 py-2">{formatAmount(line.amountInclVat)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Matches</h3>
                  <p className="text-xs text-muted-foreground">
                    {matches.length} gevonden
                  </p>
                </div>
                <div className="space-y-2">
                  {matches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Er zijn nog geen matches voor deze factuur.
                    </p>
                  ) : (
                    matches.map((match: FinanceMatchRecord) => (
                      <div
                        key={match.id}
                        className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Transactie {match.transactionReference || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Bedrag {formatAmount(match.transactionAmount)} -
                            {match.transactionBookingDate
                              ? ` ${formatDate(match.transactionBookingDate)}`
                              : " Datum onbekend"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Status: {match.matchStatus || "onbekend"} - Score: {match.confidenceScore != null
                              ? `${Math.round(match.confidenceScore * 100)}%`
                              : "n.v.t."}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMatchAction(match.id, "confirm")}
                            disabled={matchUpdating === match.id}
                          >
                            {matchUpdating === match.id && (
                              <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Bevestig
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMatchAction(match.id, "reject")}
                            disabled={matchUpdating === match.id}
                          >
                            Afwijzen
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-600"
                            onClick={() => handleMatchAction(match.id, "delete")}
                            disabled={matchUpdating === match.id}
                          >
                            Verwijderen
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="space-y-2 rounded-md border p-4">
                <h3 className="text-sm font-semibold">Bestandsinfo</h3>
                <p className="text-xs text-muted-foreground">
                  Bestand: {selectedInvoice.originalFilename || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Map: {selectedInvoice.emailFolder || "—"} - Afzender: {selectedInvoice.emailSender || "—"}
                </p>
              </section>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Geen factuur geselecteerd.</p>
          )}
          <DialogFooter className="mt-4 flex flex-col gap-2 md:flex-row md:justify-between">
            <Button
              variant="destructive"
              onClick={handleInvoiceDelete}
              disabled={!selectedInvoice || deletingInvoice}
            >
              {deletingInvoice && (
                <IconsComponent.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verwijder factuur
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDetailOpen(false);
                setSelectedInvoice(null);
              }}
            >
              Sluiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

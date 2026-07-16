'use client';

import { useState, useMemo, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { calculateTotals } from '../utils/calculateTotals';
import { formatMinor } from '@/lib/utils/money';
import { CreateReceiptInput, DiscountType, PaymentMethod } from '../api/receiptsApi';

interface ItemRow {
  localId: string;
  name: string;
  quantity: string;
  unitPriceMajor: string;
}

interface ReceiptFormProps {
  currency: string;
  taxPercentage: number;
  onSubmit: (input: Omit<CreateReceiptInput, 'clientReceiptId'>) => void;
  isPending: boolean;
}

function emptyRow(): ItemRow {
  return { localId: crypto.randomUUID(), name: '', quantity: '1', unitPriceMajor: '' };
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'pos', label: 'POS' },
  { value: 'other', label: 'Other' },
];

export function ReceiptForm({ currency, taxPercentage, onSubmit, isPending }: ReceiptFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [rows, setRows] = useState<ItemRow[]>([emptyRow()]);
  const [discountType, setDiscountType] = useState<DiscountType | 'none'>('none');
  const [discountValue, setDiscountValue] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  function updateRow(localId: string, patch: Partial<ItemRow>) {
    setRows((prev) => prev.map((row) => (row.localId === localId ? { ...row, ...patch } : row)));
  }
  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }
  function removeRow(localId: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.localId !== localId) : prev));
  }

  const parsedItems = useMemo(
    () =>
      rows
        .filter((row) => row.name.trim() && Number(row.quantity) > 0)
        .map((row) => ({
          name: row.name.trim(),
          quantity: Number(row.quantity),
          unitPriceMinor: Math.round(Number(row.unitPriceMajor || 0) * 100),
        })),
    [rows]
  );

  const resolvedDiscountValue = discountValue ? Number(discountValue) : undefined;
  const discountValueMinor =
    discountType === 'flat' && resolvedDiscountValue ? Math.round(resolvedDiscountValue * 100) : resolvedDiscountValue;

  const totals = useMemo(
    () =>
      calculateTotals(
        parsedItems,
        discountType === 'none' ? undefined : discountType,
        discountType === 'none' ? undefined : discountValueMinor,
        taxPercentage
      ),
    [parsedItems, discountType, discountValueMinor, taxPercentage]
  );

  const canSubmit = parsedItems.length > 0 && !isPending;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({
      customerName: customerName.trim() || undefined,
      items: parsedItems,
      discountType: discountType === 'none' ? undefined : discountType,
      discountValue: discountType === 'none' ? undefined : discountValueMinor,
      notes: notes.trim() || undefined,
      paymentMethod,
      clientCreatedAt: new Date().toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="md:grid md:grid-cols-[1fr_320px] md:items-start md:gap-6">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="customerName">Customer name (optional)</Label>
          <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>

        <div className="space-y-3">
          <Label>Items *</Label>
          {rows.map((row, i) => (
            <Card key={row.localId} elevation="sm" className="animate-fade-in-up space-y-2 p-3"
              style={{ animationDelay: `${Math.min(i, 5) * 30}ms` }}>
              <div className="flex items-center gap-2">
                <Input className="flex-1" placeholder="Item name" value={row.name}
                  onChange={(e) => updateRow(row.localId, { name: e.target.value })} />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove item"
                  onClick={() => removeRow(row.localId)} disabled={rows.length === 1}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" min="1" placeholder="Qty" value={row.quantity}
                  onChange={(e) => updateRow(row.localId, { quantity: e.target.value })} />
                <Input type="number" min="0" step="0.01" placeholder="Price" value={row.unitPriceMajor}
                  onChange={(e) => updateRow(row.localId, { unitPriceMajor: e.target.value })} />
              </div>
            </Card>
          ))}
          <Button type="button" variant="outline" className="w-full" onClick={addRow}>+ Add item</Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Discount</Label>
            <Select value={discountType} onValueChange={(v) => setDiscountType(v as DiscountType | 'none')}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="flat">Flat amount</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Payment method</Label>
            <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {discountType !== 'none' && (
          <div className="space-y-1.5">
            <Label>{discountType === 'flat' ? 'Discount amount' : 'Discount percent'}</Label>
            <Input type="number" min="0" step={discountType === 'flat' ? '0.01' : '1'} value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)} />
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <Button type="submit" disabled={!canSubmit} className="w-full md:hidden">
          {isPending ? 'Saving…' : 'Save receipt'}
        </Button>
      </div>

      <Card elevation="md" className="mt-6 space-y-1 p-4 text-sm md:sticky md:top-8 md:mt-0">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-money">{formatMinor(totals.subtotalMinor, currency)}</span></div>
        {totals.discountAmountMinor > 0 && (
          <div className="flex justify-between text-muted-foreground"><span>Discount</span><span className="font-money">-{formatMinor(totals.discountAmountMinor, currency)}</span></div>
        )}
        {taxPercentage > 0 && (
          <div className="flex justify-between text-muted-foreground"><span>Tax ({taxPercentage}%)</span><span className="font-money">{formatMinor(totals.taxAmountMinor, currency)}</span></div>
        )}
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
          <span>Total</span><span className="font-money">{formatMinor(totals.totalMinor, currency)}</span>
        </div>
        <Button type="submit" disabled={!canSubmit} className="mt-3 hidden w-full md:flex">
          {isPending ? 'Saving…' : 'Save receipt'}
        </Button>
      </Card>
    </form>
  );
}
'use client';

import { useState, FormEvent } from 'react';
import { Business, BusinessInput } from '../api/businessApi';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface BusinessFormProps {
  initialValues?: Business;
  defaultEmail?: string;
  onSubmit: (input: BusinessInput) => void;
  isPending: boolean;
  submitLabel: string;
}

const CURRENCIES = ['NGN', 'GHS', 'KES', 'ZAR', 'USD'];

export function BusinessForm({ initialValues, defaultEmail, onSubmit, isPending, submitLabel }: BusinessFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [phone, setPhone] = useState(initialValues?.phone ?? '');
  const [email, setEmail] = useState(initialValues?.email ?? defaultEmail ?? '');
  const [address, setAddress] = useState(initialValues?.address ?? '');
  const [currency, setCurrency] = useState(initialValues?.currency ?? 'NGN');
  const [receiptPrefix, setReceiptPrefix] = useState(initialValues?.receiptPrefix ?? 'RCPT');
  const [taxPercentage, setTaxPercentage] = useState(initialValues?.taxPercentage?.toString() ?? '0');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      currency,
      receiptPrefix: receiptPrefix.trim().toUpperCase() || 'RCPT',
      taxPercentage: Number(taxPercentage) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Business name *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Phone number *</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Address</Label>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={(val) => setCurrency(val ?? 'NGN')}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Receipt prefix</Label>
          <Input value={receiptPrefix} onChange={(e) => setReceiptPrefix(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Tax percentage (optional)</Label>
        <Input type="number" min="0" max="100" step="0.1" value={taxPercentage}
          onChange={(e) => setTaxPercentage(e.target.value)} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving…' : submitLabel}
      </Button>
    </form>
  );
}
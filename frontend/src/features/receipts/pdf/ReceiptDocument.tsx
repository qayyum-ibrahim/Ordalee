import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { Receipt } from '../api/receiptsApi';
import { Business } from '@/features/business/api/businessApi';
import { formatMinor } from '@/lib/utils/money';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: 'Helvetica', color: '#1F2323' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  logo: { width: 48, height: 48, marginBottom: 8 },
  businessName: { fontSize: 16, fontWeight: 700 },
  metaBlock: { alignItems: 'flex-end' },
  receiptNumber: { fontSize: 14, fontWeight: 700, color: '#1B4B5A' },
  sectionLabel: { fontSize: 9, color: '#6B6459', marginBottom: 2, textTransform: 'uppercase' },
  table: { marginTop: 16, borderTop: '1 solid #E7E3DC' },
  tableRow: { flexDirection: 'row', paddingVertical: 6, borderBottom: '1 solid #E7E3DC' },
  tableHeaderRow: { flexDirection: 'row', paddingVertical: 6, borderBottom: '1 solid #1F2323' },
  colName: { flex: 3 },
  colQty: { flex: 1, textAlign: 'right' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  colSubtotal: { flex: 1.5, textAlign: 'right' },
  totalsBlock: { marginTop: 16, alignSelf: 'flex-end', width: 200 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, marginTop: 4, borderTop: '1 solid #1F2323' },
  grandTotalText: { fontSize: 12, fontWeight: 700 },
  notes: { marginTop: 24, fontSize: 9, color: '#6B6459' },
  footer: { marginTop: 32, textAlign: 'center', fontSize: 9, color: '#6B6459' },
});

interface ReceiptDocumentProps {
  receipt: Receipt;
  business: Business;
}

export function ReceiptDocument({ receipt, business }: ReceiptDocumentProps) {
  const date = new Date(receipt.clientCreatedAt).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            {business.logoUrl && <Image src={business.logoUrl} style={styles.logo} />}
            <Text style={styles.businessName}>{business.name}</Text>
            {business.phone && <Text>{business.phone}</Text>}
            {business.address && <Text>{business.address}</Text>}
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionLabel}>Receipt</Text>
            <Text style={styles.receiptNumber}>{receipt.receiptNumber}</Text>
            <Text style={{ marginTop: 8 }}>{date}</Text>
          </View>
        </View>

        {receipt.customerName && (
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.sectionLabel}>Customer</Text>
            <Text>{receipt.customerName}</Text>
          </View>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.colName}>Item</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colSubtotal}>Subtotal</Text>
          </View>
          {receipt.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colName}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatMinor(item.unitPriceMinor, business.currency)}</Text>
              <Text style={styles.colSubtotal}>{formatMinor(item.subtotalMinor, business.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text>Subtotal</Text>
            <Text>{formatMinor(receipt.subtotalMinor, business.currency)}</Text>
          </View>
          {receipt.discountAmountMinor > 0 && (
            <View style={styles.totalsRow}>
              <Text>Discount</Text>
              <Text>-{formatMinor(receipt.discountAmountMinor, business.currency)}</Text>
            </View>
          )}
          {receipt.taxAmountMinor > 0 && (
            <View style={styles.totalsRow}>
              <Text>Tax ({receipt.taxPercentage}%)</Text>
              <Text>{formatMinor(receipt.taxAmountMinor, business.currency)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalText}>Total</Text>
            <Text style={styles.grandTotalText}>{formatMinor(receipt.totalMinor, business.currency)}</Text>
          </View>
        </View>

        {receipt.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text>{receipt.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>Thank you for your business.</Text>
      </Page>
    </Document>
  );
}
import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { Receipt } from '../api/receiptsApi';
import { Business } from '@/features/business/api/businessApi';
import { formatMinor } from '@/lib/utils/money';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinaryImage';

Font.register({
  family: 'NotoSans',
  fonts: [
    { src: '/fonts/NotoSans-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/NotoSans-Bold.ttf', fontWeight: 700 },
  ],
});

const COLOR = {
  primary: '#1B4B5A',
  text: '#1F2323',
  muted: '#6B6459',
  border: '#E7E3DC',
  paper: '#FAF9F6',
};

const styles = StyleSheet.create({
  page: { padding: 0, fontSize: 10, fontFamily: 'NotoSans', color: COLOR.text },
  headerBar: {
    backgroundColor: COLOR.primary,
    paddingHorizontal: 32,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: { width: 44, height: 44, marginBottom: 8, borderRadius: 4 },
  businessName: { fontSize: 16, fontWeight: 700, color: '#FFFFFF' },
  businessMeta: { fontSize: 9, color: '#FFFFFF', opacity: 0.85, marginTop: 2 },
  metaBlock: { alignItems: 'flex-end' },
  receiptLabel: { fontSize: 8, color: '#FFFFFF', opacity: 0.75, textTransform: 'uppercase', letterSpacing: 1 },
  receiptNumber: { fontSize: 15, fontWeight: 700, color: '#FFFFFF', marginTop: 2 },
  dateText: { fontSize: 9, color: '#FFFFFF', opacity: 0.85, marginTop: 8 },
  body: { padding: 32 },
  sectionLabel: { fontSize: 8, color: COLOR.muted, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  customerBlock: { marginBottom: 20 },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLOR.paper,
    borderBottom: `1 solid ${COLOR.border}`,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeaderText: { fontSize: 8, fontWeight: 700, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 8, borderBottom: `1 solid ${COLOR.border}` },
  colName: { flex: 3 },
  colQty: { flex: 1, textAlign: 'right' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  colSubtotal: { flex: 1.5, textAlign: 'right' },
  totalsBlock: { marginTop: 20, alignSelf: 'flex-end', width: 220 },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalsLabel: { color: COLOR.muted },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: COLOR.primary,
    borderRadius: 4,
  },
  grandTotalLabel: { fontSize: 11, fontWeight: 700, color: '#FFFFFF' },
  grandTotalValue: { fontSize: 13, fontWeight: 700, color: '#FFFFFF' },
  notes: { marginTop: 24, fontSize: 9, color: COLOR.muted, borderTop: `1 solid ${COLOR.border}`, paddingTop: 12 },
  footer: { marginTop: 32, textAlign: 'center', fontSize: 10, color: COLOR.primary, fontWeight: 700 },
  footerSub: { marginTop: 4, textAlign: 'center', fontSize: 8, color: COLOR.muted },
  voidStamp: { position: 'absolute', top: '38%', left: '18%', transform: 'rotate(-25deg)' },
voidStampText: { fontSize: 72, fontWeight: 700, color: 'rgba(192, 57, 43, 0.3)' },
});

interface ReceiptDocumentProps {
  receipt: Receipt;
  business: Business;
}

export function ReceiptDocument({ receipt, business }: ReceiptDocumentProps) {
  const date = new Date(receipt.clientCreatedAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBar}>
          <View>
            {business.logoUrl && (
  <Image src={getOptimizedImageUrl(business.logoUrl, { width: 120, height: 120, format: 'jpg' })} style={styles.logo} />
)}
            <Text style={styles.businessName}>{business.name}</Text>
            {business.phone && <Text style={styles.businessMeta}>{business.phone}</Text>}
            {business.address && <Text style={styles.businessMeta}>{business.address}</Text>}
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.receiptLabel}>Receipt</Text>
            <Text style={styles.receiptNumber}>{receipt.receiptNumber}</Text>
            <Text style={styles.dateText}>{date}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {receipt.customerName && (
            <View style={styles.customerBlock}>
              <Text style={styles.sectionLabel}>Billed to</Text>
              <Text>{receipt.customerName}</Text>
            </View>
          )}

          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colName, styles.tableHeaderText]}>Item</Text>
            <Text style={[styles.colQty, styles.tableHeaderText]}>Qty</Text>
            <Text style={[styles.colPrice, styles.tableHeaderText]}>Price</Text>
            <Text style={[styles.colSubtotal, styles.tableHeaderText]}>Subtotal</Text>
          </View>
          {receipt.items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colName}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatMinor(item.unitPriceMinor, business.currency)}</Text>
              <Text style={styles.colSubtotal}>{formatMinor(item.subtotalMinor, business.currency)}</Text>
            </View>
          ))}

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text>{formatMinor(receipt.subtotalMinor, business.currency)}</Text>
            </View>
            {receipt.discountAmountMinor > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount</Text>
                <Text>-{formatMinor(receipt.discountAmountMinor, business.currency)}</Text>
              </View>
            )}
            {receipt.taxAmountMinor > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Tax ({receipt.taxPercentage}%)</Text>
                <Text>{formatMinor(receipt.taxAmountMinor, business.currency)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatMinor(receipt.totalMinor, business.currency)}</Text>
            </View>
          </View>

          {receipt.notes && (
            <View style={styles.notes}>
              <Text style={styles.sectionLabel}>Notes</Text>
              <Text>{receipt.notes}</Text>
            </View>
          )}

          <Text style={styles.footer}>Thank you for choosing {business.name}.</Text>
          <Text style={styles.footerSub}>Generated with Ordalee</Text>
        </View>
        {receipt.status === 'void' && (
  <View style={styles.voidStamp}>
    <Text style={styles.voidStampText}>VOID</Text>
  </View>
)}
      </Page>
    </Document>
  );
}
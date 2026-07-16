export const SUPPORT_WHATSAPP_NUMBER = '2347026010646'; // wa.me format: no +, no spaces

export function getSupportWhatsAppLink(message: string): string {
  return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
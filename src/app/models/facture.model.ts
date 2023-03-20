import { FactureLabel } from "./facturelabel.model";

export interface Facture
{
  factureId: string;
  creator: string;
  factureNumber: number;
  clientFirstName: string;
  clientLastName: string;
  clientAddress: string;
  date: Date;
  factureLabels: FactureLabel[];
  paymentType: string;
  clientMail: string;
  clientSexe: string;
  clientCity: string;
  clientZipCode: number | null;
  invoiceDiscount: number;
}

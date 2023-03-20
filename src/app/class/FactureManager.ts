import { Facture } from "src/app/models/facture.model";
import { Settings } from "src/app/models/settings.model";
import emailjs from '@emailjs/browser';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { UtilityService } from 'src/app/services/Utility.service';
import { PDFManager } from 'src/app/class/PDFManager';
import emailJsData from '../../../config/emailjs.json';
import invoiceData from '../../../config/InvoiceData.json';

let TVAAmount: number = 20;

export class FactureManager {

  constructor() {
  }

  public static async PreviewFacture(facture: Facture): Promise<void> {
    const factureData = await FactureManager.GenerateFacture(facture);
    const blob = new Blob([factureData], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob));
  }

  public static GetPriceTTCStr(facture: Facture): number {
    var TotalTTC = 0;
    for (var i = 0; i < facture.factureLabels.length; i++) {
      TotalTTC += facture.factureLabels[i].priceTTC * facture.factureLabels[i].quantity;
    }
    return TotalTTC;
  }

  public static async SendFacture(factureRaw: Uint8Array, IsBusiness: boolean, ClientEmail: string, ClientSexe: string, ClientName: string, factureId: number, year: number): Promise<void> {
    var strGenre: string = (ClientSexe === "Homme" || ClientSexe === "homme") ? "Monsieur" : "Madame";
    var strGenreSatisfied: string = (ClientSexe === "Homme" || ClientSexe === "homme") ? "satisfait" : "satisfaite";
    var strGreeting = (new Date().getHours() > 18) ? "Bonsoir" : "Bonjour";

    let userName: string = localStorage.getItem('firstname')!;
    if (userName === null) {
      userName = emailJsData.defaultUserName;
    }

    emailjs.send(emailJsData.serviceId, !IsBusiness ? emailJsData.templateId : emailJsData.templateIdPro,
      {
        user: userName,
        nom: ClientName,
        email: ClientEmail,
        genre: strGenre,
        satisfait: strGenreSatisfied,
        salutation: strGreeting,
        facturename: "Facture_" + year + "_" + factureId + "_" + emailJsData.companyName + ".pdf",
        facturedata: UtilityService._arrayBufferToBase64(factureRaw),
        signature: localStorage.getItem('signature')!,
      }, emailJsData.publicKey).then(function (response) {
        console.log('SUCCESS!', response.status, response.text);
      }, function (error) {
        console.log('FAILED...', error);
      });
  }

  public static async GenerateFactures(factures: Facture[]): Promise<Uint8Array[]> {
    var rawFactures: Uint8Array[] = [];
    for (var facture of factures) {
      rawFactures.push(await FactureManager.GenerateFacture(facture));
    }
    return rawFactures;
  }


  public static async GenerateFacture(facture: Facture): Promise<Uint8Array> {
    const settings: Settings = {
      InvoiceLegalNotice: invoiceData.noticeLegal,
      InvoiceFooter: invoiceData.footer1,
      InvoiceFooter2: invoiceData.footer2,
      TVAAmount: TVAAmount,
    }

    return PDFManager.GetInstance().DrawInvoice(facture, settings);
  }

  public static async DownloadFacture(facture: Facture): Promise<void> {
    const factureName = facture.date.getFullYear() + "-" + UtilityService.addLeadingZeros(facture.factureNumber, 4);
    const factureData = await FactureManager.GenerateFacture(facture);
    this.DownloadInternalFacture(factureData, factureName, new JSZip(), false);
  }

  public static async DownloadFactures(factures: Facture[]): Promise<void> {
    if (factures.length === 0) {
      alert("Aucune facture à télécharger");
      return;
    }
    if (factures.length === 1) {
      this.DownloadFacture(factures[0]);
      return;
    }

    const facturesDatas = await this.GenerateFactures(factures);
    const zip = new JSZip();
    for (let index = 0; index < facturesDatas.length; index++) {
      const factureName = factures[index].date.getFullYear() + "-" + UtilityService.addLeadingZeros(factures[index].factureNumber, 4);
      this.DownloadInternalFacture(facturesDatas[index], factureName, zip, true);
    }

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      FileSaver.saveAs(content, 'factures.zip');
    });
  }

  public static GetIsMultiPayment(facture: Facture): boolean {
    if (facture.paymentType != "") {
      return false;
    }

    let paymentType = facture.factureLabels[0].paymentType;
    for (let index = 1; index < facture.factureLabels.length; index++) {
      if (facture.factureLabels[index].paymentType != paymentType) {
        return true;
      }
    }
    return false;
  }

  private static async DownloadInternalFacture(factureData: Uint8Array, factureName: string, zip: JSZip, IsZip: boolean): Promise<void> {
    var blob = new Blob([factureData], { type: "application/pdf" });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = factureName + ".pdf";
    console.log("IsZip");
    console.log(IsZip);
    if (IsZip) {
      zip.file(factureName + ".pdf", blob);
    }
    else {
      link.click(); //download the file separately
    }
  }
}

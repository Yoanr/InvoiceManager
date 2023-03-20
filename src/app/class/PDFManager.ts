import { PDFDocument, PDFPage, rgb } from 'pdf-lib';

import { UtilityService } from 'src/app/services/Utility.service';
import { Facture } from '../models/facture.model';
import { FactureLabel } from "../models/facturelabel.model";
import { Settings } from '../models/settings.model';
import { FontManager } from 'src/app/class/FontManager';
import { FactureManager } from './FactureManager';
import invoiceData from '../../../config/InvoiceData.json';

interface InvoiceTotal {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
}

//Todo: Implement Settings
//Todo: Give param pdf info

export class PDFManager {
  private static _instance: PDFManager | null = null;

  private Height: number = 0;
  private Width: number = 0;

  private FontManager: any = null;
  private PdfDoc: any = null;
  private Page: any = null;

  private IsMultiPayment : boolean = false;

  public static GetInstance(): PDFManager {
    PDFManager._instance = PDFManager._instance || new PDFManager();
    return PDFManager._instance;
  }

  public async Init(): Promise<void> {
    this.PdfDoc = await PDFDocument.create();
    this.Page = (this.PdfDoc as PDFDocument).addPage();

    this.Page.setSize(595, 842); //A4 Format

    this.Height = this.Page.getSize().height;
    this.Width = this.Page.getSize().width;

    this.FontManager = new FontManager();
    console.log("BEFORE INIT FONT")
    await (this.FontManager as FontManager).Init(this.PdfDoc);
    console.log("AFTER INIT FONT")
  }

  public async DrawInvoice(facture: Facture, settings: Settings): Promise<Uint8Array> {

    await this.Init();

    this.IsMultiPayment = FactureManager.GetIsMultiPayment(facture);

    let invoiceTotal: InvoiceTotal =
    {
      totalHT: 0,
      totalTVA: 0,
      totalTTC: 0
    };

    let dateStr = UtilityService.getDateStr(facture.date);
    let pdfName = facture.date.getFullYear() + "-" + UtilityService.addLeadingZeros(facture.factureNumber, 4);

    (this.FontManager as FontManager).SetCurrentFontData(FontManager.NormalFontData);
    // DRAW LOGO
    await this.DrawImage('assets/img/logo_entreprise.png', 30, this.Height - 40, 0.25);

    // DRAW STATIC TEXTS
    this.DrawText("Date : " + dateStr, 303, 40);
    this.DrawText("N° de facture : " + pdfName, 439, 40);

    let clientZipCodeStr =  (facture.clientZipCode != null) ? facture.clientZipCode : ""

    this.DrawMultiText(facture.clientFirstName + ' ' + facture.clientLastName + "\n" + facture.clientAddress + "\n" + clientZipCodeStr + ' ' + facture.clientCity, 303, (69 + 14), 14, 45);

    this.DrawText("Libellé", 30, 175);
    this.DrawText("Qté", 303, 175);
    this.DrawText("Prix Unit HT", 372, 175);
    this.DrawText("Montant HT", 503, 175);

    //DRAW TAMPON + PAYMENT METHOD
    if(!this.IsMultiPayment)
    {
      if(facture.paymentType != "")
      {
        this.DrawText("Payé par " + facture.paymentType, 321, 651);
      }
      else {
        this.DrawText("Payé par " + facture.factureLabels[0].paymentType, 321, 651);
      }
    }

    await this.DrawImage('assets/img/cachet_entreprise.png', 440, this.Height - (678 + 40), 0.25);

    // DRAW DYNAMIC LINES
    var startingPosition = this.drawInvoiceLines(224, facture, settings, invoiceTotal);

    (this.FontManager as FontManager).SetCurrentFontData(FontManager.LightFontData);

    // DRAW LEGAL TEXT
    this.DrawMultiText(settings.InvoiceLegalNotice, 40, 654, 14, 55);
    (this.Page as PDFPage).drawRectangle({
      x: 30,
      y: this.Height - 753,
      width: 263,
      height: 118,
      borderWidth: 0.5,
      opacity: 0.8,
      borderColor: rgb(0, 0, 0),
    });

    (this.FontManager as FontManager).SetCurrentFontData(FontManager.SmallFontData);

    // DRAW FOOTER
    this.DrawText(settings.InvoiceFooter, this.AlignTextOnCenter(settings.InvoiceFooter, 8), 815);
    this.DrawText(settings.InvoiceFooter2, this.AlignTextOnCenter(settings.InvoiceFooter2, 8), 827);

    // DRAW DELIMITER
    this.DrawLine(30, 204, 535, 0.5, 0.1);

    // DRAW TOTAL
    this.DrawTotal(startingPosition + 41, 565, facture, settings, invoiceTotal);

    // SET METADATA
    this.PdfDoc.setTitle(pdfName.toString());
    this.PdfDoc.setAuthor(facture.creator);
    this.PdfDoc.setSubject('Facture');
    this.PdfDoc.setCreator(invoiceData.companyName);
    this.PdfDoc.setCreationDate(new Date());
    this.PdfDoc.setModificationDate(new Date());

    console.log("DrawInvoice::END")
    // SAVE PDF
    return await (this.PdfDoc as PDFDocument).save();
  }

  private constructor() {
    if (PDFManager._instance) {
      throw new Error("Error: Instantiation failed: Use PDFManager.GetInstance() instead of new.");
    }
  }

  private drawInvoiceLines(startingPosition: number, facture: Facture, settings: Settings, invoiceTotal: InvoiceTotal): number {
    var lastPosition = 0;
    const lines: FactureLabel[] = facture.factureLabels;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].quantity == null || lines[i].quantity == 0 || lines[i].priceTTC == null || lines[i].priceTTC == 0) {
        if (lines.length == 1) {
          return 260;
        }
        continue;
      }

      lastPosition = this.DrawInvoiceLine(startingPosition, lines[i], settings, invoiceTotal);
      var nbrOfLines = lines[i].libelle.split(/\r\n|\r|\n/).length;
      startingPosition = 10 + lastPosition + ((nbrOfLines) * 10);
      if (nbrOfLines > 1) {
        startingPosition -= (nbrOfLines - 1) * 10;
      }
      // DRAW DELIMITER
      this.DrawLine(30, lastPosition, 535, 0.5, 0.1);
    }
    return lastPosition + 30;
  }

  private DrawInvoiceLine(position: number, line: any, settings: Settings, invoiceTotal: InvoiceTotal): number {
    let paymentTypeStr = (this.IsMultiPayment) ? " (Payé par " + line.paymentType  +  ")" : "";
    var lastPosition = this.DrawMultiText(line.libelle + paymentTypeStr, 30, position, 14, 45);

    var quantityStr = line.quantity.toString();
    this.DrawText(quantityStr, this.AlignTextOnRight(quantityStr, 318), position);

    var tVAAmountTTC = (line.priceTTC * settings.TVAAmount) / (100 + settings.TVAAmount)
    var priceHT = line.priceTTC - tVAAmountTTC;
    var lineTotalTTC = line.priceTTC * line.quantity;

    invoiceTotal.totalTTC += lineTotalTTC;
    invoiceTotal.totalHT += priceHT * line.quantity;

    invoiceTotal.totalTVA += (lineTotalTTC * settings.TVAAmount) / (100 + settings.TVAAmount);

    var priceHTStr = UtilityService.formatPrice(priceHT);
    this.DrawText(priceHTStr, this.AlignTextOnRight(priceHTStr, 425), position);

    var TotalStr = UtilityService.formatPrice(priceHT * line.quantity);
    this.DrawText(TotalStr, this.AlignTextOnRight(TotalStr, 556), position);

    return lastPosition;
  }

  private DrawTotal(startingPosition: number, alignOnRightValue: number, facture: Facture, settings: Settings, invoiceTotal: InvoiceTotal): void {
    (this.FontManager as FontManager).SetCurrentFontData(FontManager.NormalFontData);
    this.DrawText("Total HT", 30, startingPosition);
    var totalHT = UtilityService.formatPrice(invoiceTotal.totalHT);
    this.DrawText(totalHT, this.AlignTextOnRight(totalHT, alignOnRightValue), startingPosition);
    this.DrawLine(30, (startingPosition + 24) - 10, 535, 0.5, 0.1);
    this.DrawText("Total TVA (" + settings.TVAAmount + "%)", 30, (startingPosition + 34));
    var totalTVA = UtilityService.formatPrice(invoiceTotal.totalTVA);
    this.DrawText(totalTVA, this.AlignTextOnRight(totalTVA, alignOnRightValue), (startingPosition + 34));

    if (facture.invoiceDiscount == null || facture.invoiceDiscount == 0) {
      this.DrawLine(30, (startingPosition + 58) - 10, 535, 0.5, 0.8);
      this.DrawText("Total TTC", 30, (startingPosition + 68));

      var totalTTC = UtilityService.formatPrice(invoiceTotal.totalTTC);
      this.DrawText(totalTTC, this.AlignTextOnRight(totalTTC, alignOnRightValue), (startingPosition + 68));
    }
    else {
      this.DrawLine(30, (startingPosition + 58) - 10, 535, 0.5, 0.1);
      this.DrawText("Remise", 30, (startingPosition + 68));

      var discount = facture.invoiceDiscount.toString() + " %";
      this.DrawText(discount, this.AlignTextOnRight(discount, alignOnRightValue), (startingPosition + 68));
      this.DrawLine(30, (startingPosition + 92) - 10, 535, 0.5, 0.8);
      this.DrawText("Total TTC", 30, (startingPosition + 102));

      var totalTTCWithoutDiscount = invoiceTotal.totalTTC;
      invoiceTotal.totalTTC = invoiceTotal.totalTTC - (invoiceTotal.totalTTC * (facture.invoiceDiscount / 100));

      var totalTTCStr = UtilityService.formatPrice(invoiceTotal.totalTTC);
      var totalTTCWithoutDiscountStr = UtilityService.formatPrice(totalTTCWithoutDiscount);
      this.DrawText(totalTTCStr, this.AlignTextOnRight(totalTTCStr, alignOnRightValue), (startingPosition + 102));

      let currentFontData = (this.FontManager as FontManager).GetCurrentFontData();
      var totalTTCStrLength = currentFontData.font.widthOfTextAtSize(totalTTCStr, currentFontData.fontSize);

      this.DrawLine(this.AlignTextOnRight(totalTTCStr, alignOnRightValue - 70), (startingPosition + 102 - 3), totalTTCStrLength, 0.5, 0.6);

      (this.FontManager as FontManager).SetCurrentFontData(FontManager.LighterFontData);
      this.DrawText(totalTTCWithoutDiscountStr, this.AlignTextOnRight(totalTTCWithoutDiscountStr, alignOnRightValue - 70), (startingPosition + 102));
    }
  }

  private DrawText(value: string, x: number, y: number): void {
    let currentFontData = (this.FontManager as FontManager).GetCurrentFontData();
    (this.Page as PDFPage).drawText((value), {
      x: x,
      y: this.Height - y,
      size: currentFontData.fontSize,
      font: currentFontData.font,
      color: currentFontData.fontColor,
      opacity: currentFontData.fontOpacity,
    });
  }

  private async DrawLine(x : number, y : number, lenght : number, thickness : number, opacity : number)
  {
    this.Page.drawLine({
      start: { x: x, y: this.Height - y },
      end: { x: x + lenght, y: this.Height - y },
      thickness: thickness,
      color: rgb(0, 0, 0),
      opacity: opacity,
    });
  }

  private async DrawImage(logoUrl: string, x: number, y: number, scale: number): Promise<void> {
    const LogoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
    const LogoImage = await this.PdfDoc.embedPng(LogoBytes);
    const jpgDims = LogoImage.scale(scale);
    this.Page.drawImage(LogoImage, {
      x: x,
      y: y,
      opacity: 1,
      width: jpgDims.width,
      height: jpgDims.height,
    });
  }

  private DrawMultiText(value: string, x: number, y: number, marginText: number, maxLength: number): number {
    var count = 0;
    var stringArray = value.split(/\r\n|\r|\n/);
    for (let i = 0; i < stringArray.length; i++) {
      var re = new RegExp(`.{1,${maxLength}}`, 'g');
      const array = stringArray[i].match(re) || [];
      for (let j = 0; j < array.length; j++) {
        this.DrawText(UtilityService.ltrim(array[j]), x, y + (count * marginText));
        count++;
      }
    }
    if (count == 0) { count = 1; }

    return y + (count * marginText);
  }

  private AlignTextOnRight(value: string, XRightLibelleValue: number): number {
    let currentFontData = (this.FontManager as FontManager).GetCurrentFontData();
    const textWidth = currentFontData.font.widthOfTextAtSize(value, currentFontData.fontSize);
    return XRightLibelleValue - (textWidth - 1);
  }

  private AlignTextOnCenter(value: string, fontSize: number): number {
    let currentFontData = (this.FontManager as FontManager).GetCurrentFontData();
    return (this.Width - currentFontData.font.widthOfTextAtSize(value, fontSize)) / 2;
  }
}

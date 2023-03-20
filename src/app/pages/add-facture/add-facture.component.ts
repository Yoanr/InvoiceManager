import { Component, OnInit } from '@angular/core';
import { FactureManager } from 'src/app/class/FactureManager'
import { FacturesService } from 'src/app/services/factures/factures.service';
import { Facture } from "src/app/models/facture.model";
import { FactureLabel } from "src/app/models/facturelabel.model";
import { Router } from '@angular/router';
import { DateAdapter } from '@angular/material/core';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { Historique } from 'src/app/models/historique.model';
import { HistoriqueService } from 'src/app/services/historique/historique.service';
import { UtilityService } from 'src/app/services/Utility.service';
import emailJsData from '../../../../config/emailjs.json';

interface Selector
{
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-add-facture',
  templateUrl: './add-facture.component.html',
  styleUrls: ['./add-facture.component.css']
})

export class AddFactureComponent implements OnInit {

  public UtilityService = UtilityService;

  factureManager: FactureManager = new FactureManager();

  //From the view
  SendMailToUser: boolean = true;
  UserDoesntShareInfo: boolean = false;
  IsBusiness: boolean = false;
  ClientFirstName: string = "";
  ClientLastName: string = "";
  ClientSexe: string = "";
  ClientAddress: string = "";
  ClientZipCode: number | null = null;
  ClientCity: string = "";
  ClientEmail: string = "";
  PaymentMethod: string = "";//Used Before
  InvoiceDate: Date = new Date();
  InvoiceDiscount: number = null!;
  linesInvoice: FactureLabel[] = [];

  //Save old value before editing to compare

  OldUserDoesntShareInfo: boolean = false;
  OldClientFirstName: string = "";
  OldClientLastName: string = "";
  OldClientSexe: string = "";
  OldClientAddress: string = "";
  OldClientZipCode: number | null = null;
  OldClientCity: string = "";
  OldClientEmail: string = "";
  OldPaymentMethod: string = "";
  OldInvoiceDate: Date = new Date();
  OldInvoiceDiscount: number = null!;
  OldlinesInvoice: FactureLabel[] = [];

  paymentMethods: Selector[] =
  [
    {value: "carte bancaire", viewValue: 'Carte Bancaire'},
    {value: 'chèque', viewValue: 'Chèque'},
    {value: 'espèces', viewValue: 'Espèces'},
    {value: 'virement', viewValue: 'Virement'},
  ];

  sexes: Selector[] =
  [
    {value: 'homme', viewValue: 'Homme'},
    {value: 'femme', viewValue: 'Femme'},
  ]

  //Local
  isNotPreviewed = true;
  isWrong = true;

  //Edit
  isEditMode : boolean = false;
  FactureNumber : number = 0;
  FactureId : string = "";
  FactureCreator : string = "";

  constructor(public fact: FacturesService, public hist: HistoriqueService,  private router: Router, private dateAdapter: DateAdapter<Date>, public auth: AuthenticationService)
  {
    this.dateAdapter.setLocale('fr-FR');
  }

  async ngOnInit()
  {
    this.auth.checkIsLoggedIn();
    this.addNewLine();

    this.FactureId = this.router.url.split('/')[2];

    this.isEditMode = (this.FactureId !== "0");
    if(!this.isEditMode)
    {
      // ADD MODE
      return;
    }
    // EDIT MODE
    this.SendMailToUser = false;

    var factureToModity : Facture = await this.fact.getFacture(this.FactureId);

    if(factureToModity.clientFirstName === "client" && factureToModity.clientLastName === "particulier")
    {
      this.UserDoesntShareInfo = true;
    }

    this.ClientFirstName = factureToModity.clientFirstName;
    this.ClientLastName = factureToModity.clientLastName;
    this.ClientSexe = factureToModity.clientSexe;
    this.ClientAddress = factureToModity.clientAddress;
    this.ClientZipCode = factureToModity.clientZipCode;
    this.ClientCity = factureToModity.clientCity;
    this.ClientEmail = factureToModity.clientMail;

    this.InvoiceDate = new Date((factureToModity.date as any).seconds*1000);
    this.InvoiceDiscount = factureToModity.invoiceDiscount;
    this.PaymentMethod = factureToModity.paymentType;
    this.linesInvoice = factureToModity.factureLabels;

    this.FactureNumber = factureToModity.factureNumber;
    this.FactureCreator = factureToModity.creator;

    // Save oldInfo
    this.OldUserDoesntShareInfo = this.UserDoesntShareInfo;
    this.OldClientFirstName = this.ClientFirstName;
    this.OldClientLastName = this.ClientLastName;
    this.OldClientSexe = this.ClientSexe;
    this.OldClientAddress = this.ClientAddress;
    this.OldClientZipCode = this.ClientZipCode;
    this.OldClientCity = this.ClientCity;
    this.OldClientEmail = this.ClientEmail;
    this.OldPaymentMethod = this.PaymentMethod;
    this.OldInvoiceDate = this.InvoiceDate;
    this.OldInvoiceDiscount = this.InvoiceDiscount;

    for(var i = 0; i < this.linesInvoice.length; i++)
    {
      var line = this.linesInvoice[i];
      this.OldlinesInvoice.push({"libelle": line.libelle, "quantity": line.quantity, "priceTTC":  line.priceTTC, factureLabelId: "", "paymentType": line.paymentType});
    }
  }

  addNewLine() : void
  {
    this.linesInvoice.push({"libelle": "", "quantity": 0, "priceTTC": 0, factureLabelId: "", "paymentType": ""});
  };

  removeLine(index : number) : void
  {
    // remove the row specified in index
    this.linesInvoice.splice( index, 1);
    // if no rows left in the array create a blank array
    if ( this.linesInvoice.length === 0 || this.linesInvoice.length == null)
    {
      this.linesInvoice.push({"libelle": "", "quantity": 0, "priceTTC": 0, factureLabelId: "", "paymentType": ""});
    }
  };

  CheckFields() : boolean
  {
    if(!this.UserDoesntShareInfo)
    {
      if(this.ClientAddress == ""
      || this.ClientZipCode == null
      || this.ClientCity == ""
      || this.ClientEmail == "")
      {
        alert("Veuillez remplir tous les champs");
        return false;
      }

      var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (!this.ClientEmail.match(validRegex))
      {
        alert("Veuillez entrer une adresse email valide");
        return false;
      }
    }

    if(this.ClientFirstName == ""
    || this.ClientLastName == ""
    || this.InvoiceDate == null)
    {
        alert("Veuillez remplir tous les champs");
        return false;
    }

    if(this.InvoiceDate.getTime() > new Date().getTime())
    {
        alert("La date de facture ne peut pas être supérieure à la date du jour");
        return false;
    }

    if(this.linesInvoice.length == 0)
    {
      alert("Veuillez ajouter une ligne de facture");
      return false;
    }

    for(let i = 0; i < this.linesInvoice.length; i++)
    {
      if(this.linesInvoice[i].libelle == ""
      || this.linesInvoice[i].quantity == 0
      || this.linesInvoice[i].quantity == null
      || this.linesInvoice[i].priceTTC == 0
      || this.linesInvoice[i].priceTTC == null
      || this.linesInvoice[i].paymentType == "")
      {
        alert("Veuillez remplir tous les champs de la ligne " + (i+1));
        return false;
      }
    }

    if(this.linesInvoice.length == 0)
    {
      alert("Veuillez ajouter une ligne de facture");
      return false;
    }

    if(this.InvoiceDiscount >= 100)
    {
      alert("La remise ne peut pas être supérieure ou égale à 100%");
      return false;
    }
    return true;
  }

  /*private _arrayBufferToBase64( buffer : Uint8Array) : string
  {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }*/

  async PreviewPdf() : Promise<void>
  {
    this.FormatFields();
    if(this.isWrong = !this.CheckFields())
    {
      return;
    }

    var potentielInvoiceNumber = (this.isEditMode) ? this.FactureNumber : (await this.fact.getBiggestId() + 1);

    var creatorStr = (this.isEditMode) ? this.FactureCreator : this.getCreatorName();
    const facture : Facture = await this.ConvertFieldsIntoFacture(potentielInvoiceNumber, creatorStr);

    //var PathReportString = 'data:application/pdf;base64,' + (this.sanitizer.bypassSecurityTrustResourceUrl(this._arrayBufferToBase64(pdfRaw)) as any).changingThisBreaksApplicationSecurity;
    //top!.document.getElementById('ifrm')!.setAttribute("src", PathReportString);

    FactureManager.PreviewFacture(facture);
    this.isNotPreviewed = false;
  }

  FormatFields() : void {
    this.ClientFirstName = this.ClientFirstName.trim();
    this.ClientLastName = this.ClientLastName.trim();
    this.ClientAddress = this.ClientAddress.trim();
    this.ClientCity = this.ClientCity.trim();

    this.ClientEmail = this.ClientEmail.trim();

    for(let i = 0; i < this.linesInvoice.length; i++) {
      this.linesInvoice[i].libelle = this.linesInvoice[i].libelle.trim();
    }
  }

  async EditPdf(): Promise<void>
  {
    if(this.isNotPreviewed)
    {
      alert("Vous devez previsualiser avant de sauvegarder et d'envoyer le pdf!");
      return;
    }

    var creatorStr = (this.isEditMode) ? this.FactureCreator : this.getCreatorName();

    const facture : Facture = await this.ConvertFieldsIntoFacture(this.FactureNumber, creatorStr);
    this.fact.updateFacture(this.FactureId, facture);

    if(this.SendMailToUser)
    {
      var pdfRaw = await FactureManager.GenerateFacture(facture);

      FactureManager.SendFacture(pdfRaw,this.IsBusiness, this.ClientEmail.toLowerCase(), this.ClientSexe, this.ClientLastName, this.FactureNumber, this.InvoiceDate.getFullYear());
      alert("Modification et envoi de la facture effectuée: " +this.InvoiceDate.getFullYear().toString() + "_" + UtilityService.addLeadingZeros(this.FactureNumber,4));
    }
    else
    {
      alert("Modification de la facture effectuée: " +this.InvoiceDate.getFullYear().toString() + "_" + this.FactureNumber);
    }

    this.hist.addHistorique(this.getHistorique());

    this.RedirectTo();
  }

  getHistorique() : Historique
  {
    var historique : Historique  =
    {
      factureId: this.FactureId,
      factureNumber: this.FactureNumber,
      factureYear: this.InvoiceDate.getFullYear(),
      creator: this.getCreatorName(),
      date: new Date(),
      changes: []
    };

    if(this.UserDoesntShareInfo !==  this.OldUserDoesntShareInfo)
    {
      historique.changes.push({
        field: "Client particulier",
        oldValue: (this.OldUserDoesntShareInfo ? "Oui" : "Non"),
        newValue: (this.UserDoesntShareInfo ? "Oui" : "Non"),
      });
    }

    if(this.ClientFirstName !==  this.OldClientFirstName)
    {
      historique.changes.push({
        field: "Prénom du client",
        oldValue: this.OldClientFirstName,
        newValue: this.ClientFirstName,
      });
    }

    if(this.ClientLastName !==  this.OldClientLastName)
    {
      historique.changes.push({
        field: "Nom du client",
        oldValue: this.OldClientLastName,
        newValue: this.ClientLastName,
      });
    }

    if(this.ClientSexe !==  this.OldClientSexe)
    {
      historique.changes.push({
        field: "Sexe",
        oldValue: this.OldClientSexe,
        newValue: this.ClientSexe,
      });
    }

    if(this.ClientAddress !==  this.OldClientAddress)
    {
      historique.changes.push({
        field: "Adresse du client",
        oldValue: this.OldClientAddress,
        newValue: this.ClientAddress,
      });
    }

    if(this.ClientZipCode !==  this.OldClientZipCode)
    {
      historique.changes.push({
        field: "Code postal du client",
        oldValue: (this.OldClientZipCode != null) ? this.OldClientZipCode.toString() : "",
        newValue: (this.ClientZipCode != null) ? this.ClientZipCode.toString() : "",
      });
    }

    if(this.ClientCity !==  this.OldClientCity)
    {
      historique.changes.push({
        field: "Ville du client",
        oldValue: this.OldClientCity,
        newValue: this.ClientCity,
      });
    }

    if(this.ClientEmail !==  this.OldClientEmail)
    {
      historique.changes.push({
        field: "Email du client",
        oldValue: this.OldClientEmail,
        newValue: this.ClientEmail,
      });
    }

    if(this.PaymentMethod !==  this.OldPaymentMethod)
    {
      historique.changes.push({
        field: "Méthode de paiement",
        oldValue: this.OldPaymentMethod,
        newValue: this.PaymentMethod,
      });
    }

    if(this.InvoiceDate !==  this.OldInvoiceDate)
    {
      historique.changes.push({
        field: "Date de la facture",
        oldValue: UtilityService.getDateStr(this.OldInvoiceDate),
        newValue: UtilityService.getDateStr(this.InvoiceDate),
      });
    }

    if(this.InvoiceDiscount !==  this.OldInvoiceDiscount)
    {
      historique.changes.push({
        field: "Remise totale",
        oldValue: this.OldInvoiceDiscount.toString(),
        newValue: this.InvoiceDiscount.toString(),
      });
    }

    if(this.linesInvoice.length != this.OldlinesInvoice.length)
    {
      //Todo
      return historique;
    }

    for(var i = 0; i < this.linesInvoice.length; i++)
    {
      var newLine = this.linesInvoice[i];
      var oldLine = this.OldlinesInvoice[i];
      if(newLine.libelle !==  oldLine.libelle
        || newLine.priceTTC !==  oldLine.priceTTC
        || newLine.quantity !==  oldLine.quantity
        || newLine.paymentType !==  oldLine.paymentType)
      {
        historique.changes.push({
          field: "Ligne n°"+(i + 1).toString(),
          oldValue: oldLine.libelle + "(" + oldLine.paymentType + ")" + "|" + oldLine.priceTTC + "|" + oldLine.quantity,
          newValue: newLine.libelle + "(" + newLine.paymentType + ")" + "|" + newLine.priceTTC + "|" + newLine.quantity,
        });
      }
    }

    return historique;
  }

  async CreatePdf() : Promise<void>
  {
    if(this.isNotPreviewed)
    {
      alert("Vous devez previsualiser avant de sauvegarder et d'envoyer le pdf!");
      return;
    }
    var creatorStr = (this.isEditMode) ? this.FactureCreator : this.getCreatorName();
    if(creatorStr === "")
    {
      alert("Problème interne du logiciel : créateur indéfinie");
      return;
    }
    var invoiceNumber = (await this.fact.getBiggestId()) + 1;
    if(invoiceNumber == 0)
    {
      alert("Le numéro de facture ne peut pas être égale à 0, recharger la page et vérifier si vous avez internet");
      return;
    }

    const facture : Facture = await this.ConvertFieldsIntoFacture(invoiceNumber, creatorStr);
    this.fact.addFacture(facture);
    var pdfRaw = await FactureManager.GenerateFacture(facture);

    if(this.SendMailToUser)
    {
      FactureManager.SendFacture(pdfRaw, this.IsBusiness, this.ClientEmail.toLowerCase(), this.ClientSexe, this.ClientLastName, invoiceNumber, this.InvoiceDate.getFullYear());
      alert("Création et envoi de la facture effectuée: " +this.InvoiceDate.getFullYear().toString() + "_" + invoiceNumber);
    }
    else
    {
      alert("Création de la facture effectué: " +  this.InvoiceDate.getFullYear().toString() + "_" + invoiceNumber);
    }

    this.RedirectTo();
  }

  getCreatorName()
  {
    let userName : string = localStorage.getItem('firstname')!;
    if(userName === null || userName === "" || userName == undefined)
    {
      userName = emailJsData.defaultUserName;
    }
    return userName;
  }

  async ConvertFieldsIntoFacture(factureId : number, creatorStr : string) : Promise<Facture>
  {
      if(!this.InvoiceDiscount)
      {
        this.InvoiceDiscount = 0;
      }

      this.InvoiceDate.setHours(this.InvoiceDate.getHours());

      const facture: Facture =
      {
        factureId: "",
        creator: creatorStr,
        factureNumber: factureId,
        clientFirstName: this.ClientFirstName,
        clientLastName: this.ClientLastName,
        clientAddress: this.ClientAddress,
        date: this.InvoiceDate,
        factureLabels: [],
        paymentType: "", // Not used anymore (paymentType in libelle)
        clientMail: this.ClientEmail.toLowerCase(),
        clientSexe: this.ClientSexe,
        clientCity: this.ClientCity,
        clientZipCode: this.ClientZipCode,
        invoiceDiscount: this.InvoiceDiscount
      };

      for(var i = 0; i < this.linesInvoice.length; i++)
      {
        facture.factureLabels.push({
          factureLabelId: i.toString(),
          libelle: this.linesInvoice[i].libelle,
          quantity: this.linesInvoice[i].quantity!,
          priceTTC: this.linesInvoice[i].priceTTC!,
          paymentType: this.linesInvoice[i].paymentType!,
        });
      }

    return facture;
  }

  UserDoesntShareInfoUpdate()
  {
    if(this.UserDoesntShareInfo)
    {
      this.ClientFirstName = "client";
      this.ClientLastName = "particulier";
      this.ClientSexe = "homme";
      this.ClientAddress = "";
      this.ClientZipCode = null;
      this.ClientCity = "";
      this.ClientEmail = "";
    }
    else
    {
      this.ClientFirstName = "";
      this.ClientLastName = "";
      this.ClientSexe = "";
    }
    this.SendMailToUser = !this.UserDoesntShareInfo;
  }

  IsBusinessUpdate()
  {
    if(this.IsBusiness)
    {
      this.ClientFirstName = "Société";
    }else{
      this.ClientFirstName = "";
    }
  }

  FieldsUpdated()
  {
    this.isNotPreviewed = true;
  }

  RedirectTo()
  {
    this.router.navigate(['factures']);
  }
}

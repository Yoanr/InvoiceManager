import { Component, OnInit } from '@angular/core';
import { Facture } from 'src/app/models/facture.model';
import { FactureManager } from 'src/app/class/FactureManager';
import { DateAdapter } from '@angular/material/core';
import { FacturesService } from 'src/app/services/factures/factures.service';
import { Timestamp } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { UtilityService } from 'src/app/services/Utility.service';

enum Period {
  Today,
  Yesterday,
  Last7Days,
  Last30Days,
  CurrentMonth,
  PreviousMonth,
  CurrentYear,

  None = -1,
}

@Component({
  selector: 'app-factures',
  templateUrl: './factures.component.html',
  styleUrls: ['./factures.component.css']
})

export class FacturesComponent implements OnInit {

  public UtilityService = UtilityService;

  public period = Period;
  currentPeriod = Period.None;
  // Strings
  search: string = "";
  searchOn: string = "";
  displayMode: string = "list";

  // Objects
  factures: Facture[] = [];
  searchedFactures: Facture[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();
  factureManager: FactureManager = new FactureManager();

  // admin
  isAdmin: boolean = (localStorage.getItem('role')! === 'admin');
  firstName: string = localStorage.getItem('firstname')!;
  lastName: string = localStorage.getItem('lastname')!;


  constructor(private dateAdapter: DateAdapter<Date>, private fact: FacturesService, private router: Router, public auth: AuthenticationService) {
    this.dateAdapter.setLocale('fr-FR');
  }

  async ngOnInit() {
    this.auth.checkIsLoggedIn();

    await this.SearchByPeriod();
  }

  async GetFacturesByRange() {
    if (this.isAdmin) {
      this.factures = await this.fact.getFactures(this.startDate, this.endDate);
    }
    else {
      this.factures = await this.fact.getFacturesByUser(this.firstName, this.startDate, this.endDate);
    }
    this.searchedFactures = this.factures;
  }

  getPriceTTC(index: number): string {
    return UtilityService.formatPrice(FactureManager.GetPriceTTCStr(this.factures[index]));
  };

  getTotalPriceTTC(): number {
    var totalPriceTTC = 0;
    for (var i = 0; i < this.factures.length; i++) {
      totalPriceTTC += FactureManager.GetPriceTTCStr(this.factures[i]);
    }
    return totalPriceTTC;
  };

  getFormatedPriceTTC(totalPriceTTC: number): string {
    return UtilityService.formatPrice(totalPriceTTC);
  }

  getAOV(): string {
    if (this.factures.length == 0) {
      return "";
    }

    return UtilityService.formatPrice((this.getTotalPriceTTC() / this.factures.length));
  }

getPriceColumnStr() : string {
  if(!this.isAdmin || this.factures.length == 0)
  {
    return "Prix";
  }
  return this.GetTotalPriceText() + " / " + this.factures.length.toString() + " = " + this.getAOV();
}

getCurrentYearOfFacture(facture: Facture) {
  return facture.date.getFullYear();
}

toDate(date: Timestamp<Date>) {
  console.log(date)
}

listMode() {
  this.displayMode = "list";
}

gridMode() {
  this.displayMode = "grid";
}

downloadFactures()
{
  FactureManager.DownloadFactures(this.factures);
}

DownloadFacture(index : number)
{
  FactureManager.DownloadFacture(this.factures[index]);
}

GetPaymentType(facture : Facture)
{
  if(FactureManager.GetIsMultiPayment(facture))
  {
    return "Multiple";
  }
  else
  {
    if(facture.paymentType != "")
    {
      return this.Capitalize(facture.paymentType);
    }
    else
    {
      return this.Capitalize(facture.factureLabels[0].paymentType);
    }
  }
}

searchOnDate() {
  this.searchFacture();
  let localFactures: Facture[] = this.factures;
  this.factures = [];

  if (localFactures.length === 0 && this.searchOn === '') {
    localFactures = this.searchedFactures;
  }

  this.startDate.setHours(0, 0, 0, 0);
  this.endDate.setHours(23, 59, 59, 999);
  this.currentPeriod = Period.None;

  this.GetFacturesByRange();
}

  async SearchByPeriod(period : Period = Period.Today) {
  if (period === this.currentPeriod) {
    return;
  }

  this.searchFacture();
  let localFactures: Facture[] = this.factures;
  this.factures = [];

  if (localFactures.length === 0 && this.searchOn === '') {
    localFactures = this.searchedFactures;
  }

  this.setPeriod(period);

  await this.GetFacturesByRange();
  this.currentPeriod = period;
}

setPeriod(period : Period) {
  switch (period) {
    case Period.Today:
      this.startDate = new Date();
      this.endDate = new Date();
      this.startDate.setHours(0, 0, 0, 0);
      this.endDate.setHours(23, 59, 59, 999);
      break;
    case Period.Yesterday:
      this.startDate = new Date();
      this.startDate.setDate(this.startDate.getDate() - 1);

      this.endDate = new Date();
      this.endDate.setDate(this.endDate.getDate() - 1);

      this.startDate.setHours(0, 0, 0, 0);
      this.endDate.setHours(23, 59, 59, 999);
      break;
    case Period.Last7Days:
      this.startDate = new Date();
      this.startDate.setDate(this.startDate.getDate() - 7);

      this.endDate = new Date();
      this.endDate.setDate(this.endDate.getDate() - 1);

      this.startDate.setHours(0, 0, 0, 0);
      this.endDate.setHours(23, 59, 59, 999);
      break;
    case Period.Last30Days:
      this.startDate = new Date();
      this.startDate.setDate(this.startDate.getDate() - 30);

      this.endDate = new Date();

      this.startDate.setHours(0, 0, 0, 0);
      this.endDate.setHours(23, 59, 59, 999);
      break;
    case Period.CurrentMonth:
      var initDate = new Date();
      this.startDate = new Date(initDate.getFullYear(), initDate.getMonth(), 1);

      this.endDate = new Date();

      this.startDate.setHours(0, 0, 0, 0);
      this.endDate.setHours(23, 59, 59, 999);
      break;
    case Period.PreviousMonth:
      var initDate = new Date();
      this.startDate = new Date(initDate.getFullYear(), initDate.getMonth() - 1, 1);
      this.endDate = new Date(initDate.getFullYear(), initDate.getMonth(), 0);

      this.startDate.setHours(0, 0, 0, 0);
      this.endDate.setHours(23, 59, 59, 999);
      break;
    case Period.CurrentYear:
      this.startDate = new Date(new Date().getFullYear(), 0, 1);
      this.endDate = new Date();

      this.startDate.setHours(0, 0, 0, 0);
      this.endDate.setHours(23, 59, 59, 999);
      break;
    default:
      break;
  }
}

SortFacturesByFactureNumber() : Facture[] {
  let localFactures: Facture[] = this.factures;
  this.factures = [];

  var arrayOfIndex: number[] = [];

  for (let j = 0; j < localFactures.length; j++) {
    var maxfactureNumberIndex = 0;
    var maxfactureNumber = 0;
    for (let i = 0; i < localFactures.length; i++) {
      if (localFactures[i].factureNumber > maxfactureNumber && !arrayOfIndex.includes(i)) {
        maxfactureNumberIndex = i;
        maxfactureNumber = localFactures[i].factureNumber;
      }
    }
    arrayOfIndex.push(maxfactureNumberIndex);
    this.factures.push(localFactures[maxfactureNumberIndex]);
  }
  return this.factures;
}

searchFacture() {
  this.factures = [];
  if (this.search === '' || this.searchOn === '') {
    this.factures = this.searchedFactures;
    return;
  }
  for (let i = 0; i < this.searchedFactures.length; i++) {
    if (this.searchOn == 'facture')
      if ((this.getCurrentYearOfFacture(this.searchedFactures[i]) + "-" + this.searchedFactures[i].factureNumber).toString().includes(this.search)) {
        this.factures.push(this.searchedFactures[i]);
      }
    if (this.searchOn == 'creator')
      if (this.searchedFactures[i].creator.toLowerCase().includes(this.search.toLowerCase())) {
        this.factures.push(this.searchedFactures[i]);
      }
    if (this.searchOn == 'client-sexe')
      if (this.searchedFactures[i].clientSexe.toLowerCase().includes(this.search.toLowerCase())) {
        this.factures.push(this.searchedFactures[i]);
      }
    if (this.searchOn == 'client-name' || this.searchOn == '')
      if (this.searchedFactures[i].clientFirstName.toLowerCase().includes(this.search.toLowerCase())
        || this.searchedFactures[i].clientLastName.toLowerCase().includes(this.search.toLowerCase())) {
        this.factures.push(this.searchedFactures[i]);
      }
    if (this.searchOn == 'client-email')
      if (this.searchedFactures[i].clientMail.toLowerCase().includes(this.search.toLowerCase())) {
        this.factures.push(this.searchedFactures[i]);
      }
    if (this.searchOn == 'payement')
      if (this.searchedFactures[i].paymentType.toLowerCase().includes(this.search.toLowerCase())) {
        this.factures.push(this.searchedFactures[i]);
      }
  }
}

PreviewFacture(index : number)
{
  FactureManager.PreviewFacture(this.factures[index]);
}

SignOut()
{
  console.log('Signin out...');
  this.auth.SignOut();
}

GetTotalPriceText() : string
{
  return "Total: " + this.getFormatedPriceTTC(this.getTotalPriceTTC());
}

Capitalize(str : string) : string
{
  return str.charAt(0).toUpperCase() + str.slice(1);
}


}

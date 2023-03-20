import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { DateAdapter } from '@angular/material/core';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { Historique } from 'src/app/models/historique.model';
import { Edit } from 'src/app/models/edit.model';
import { HistoriqueService } from 'src/app/services/historique/historique.service';
import { UtilityService } from 'src/app/services/Utility.service';

@Component({
  selector: 'app-historiques',
  templateUrl: './historiques.component.html',
  styleUrls: ['./historiques.component.css']
})
export class HistoriquesComponent implements OnInit {
  public UtilityService = UtilityService; 

  Historiques : Historique[] = [];

  constructor(public hist: HistoriqueService,  private router: Router, private dateAdapter: DateAdapter<Date>, public auth: AuthenticationService) { }

  async ngOnInit()
  {
    this.auth.checkIsLoggedIn();

    this.Historiques = await this.hist.getHistoriques();
  }

  RedirectTo()
  {
    this.router.navigate(['factures']);
  }
}

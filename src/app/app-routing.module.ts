import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddFactureComponent } from './pages/add-facture/add-facture.component';
import { AdminBoardComponent } from './pages/admin-board/admin-board.component';
import { FacturesComponent } from './pages/factures/factures.component';
import { HistoriquesComponent } from './pages/historiques/historiques.component';
import { SignComponent } from './pages/sign/sign.component';

const routes: Routes = [
  { path: '', redirectTo: '/sign', pathMatch: 'full' },
  { path: 'sign', component:  SignComponent },
  { path: 'addFacture/:id', component:  AddFactureComponent, pathMatch: 'full' },
  { path: 'factures', component:  FacturesComponent },
  { path: 'historiques', component:  HistoriquesComponent },
  { path: 'adminBoard', component:  AdminBoardComponent }
  //{ path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

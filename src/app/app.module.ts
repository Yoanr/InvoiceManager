import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

// Firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

// Angular Material
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule} from '@angular/material/select';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';

// Personal components
import { SignComponent } from './pages/sign/sign.component';
import { AddFactureComponent } from './pages/add-facture/add-facture.component';
import { FacturesComponent } from './pages/factures/factures.component';
import { AdminBoardComponent } from './pages/admin-board/admin-board.component';
import { HistoriquesComponent } from './pages/historiques/historiques.component';

import firebaseData from '../../config/firebase.json';

const firebaseConfig = {
  apiKey: firebaseData.apiKey,
  authDomain: firebaseData.authDomain,
  projectId: firebaseData.projectId,
  storageBucket: firebaseData.storageBucket,
  messagingSenderId: firebaseData.messagingSenderId,
  appId: firebaseData.appId
};

@NgModule({
  declarations: [
    AppComponent,
    SignComponent,
    AddFactureComponent,
    FacturesComponent,
    AdminBoardComponent,
    HistoriquesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    MatCheckboxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

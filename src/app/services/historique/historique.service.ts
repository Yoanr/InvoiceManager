import { Injectable } from '@angular/core';

import firebase from 'firebase/compat/app';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

import { Historique } from 'src/app/models/historique.model';
import { query, orderBy } from "firebase/firestore";  
import { reduce } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService {

  constructor(private afs: AngularFirestore) { }

  async getHistoriquesByFactureId(factureId: string)
  {
    const historiques = await this.afs.collection<Historique>('historiques', ref => 
    ref.orderBy('date', 'desc').where('factureid','==',factureId)).get();

    let historiqueList: Historique[] = [];
    let index = 0;
    await historiques.subscribe(snapshot => { 
      snapshot.forEach(doc => {
        historiqueList.push(doc.data() as Historique);
        historiqueList[index].date = (doc.data() as any).date.toDate();
        index++;
      });
    });
    return historiqueList;
  }

  async getHistoriques() : Promise<Historique[]>
  {
    const historiques = await this.afs.collection<Historique>('historiques', ref => 
    ref.orderBy('date', 'desc')).get();

    let historiqueList: Historique[] = [];
    let index = 0;
    await historiques.subscribe(snapshot => { 
      snapshot.forEach(doc => {
        historiqueList.push(doc.data() as Historique);
        historiqueList[index].date = (doc.data() as any).date.toDate();
        index++;
      });
    });
    return historiqueList;
  }

  async addHistorique(historique: Historique) 
  {
    return await this.afs.collection('historiques').add(historique);
  }
}

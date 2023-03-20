import { Injectable } from '@angular/core';

import firebase from 'firebase/compat/app';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

import { Facture } from 'src/app/models/facture.model';
import { query, orderBy } from "firebase/firestore";  
import { reduce } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class FacturesService {
  biggestId: number = 0;

  constructor(private afs: AngularFirestore) { }

  async getFacturesByUser(firstname: string, startDate : Date, endDate : Date)
  {
    const factures = await this.afs.collection<Facture>('factures', ref => 
    ref.orderBy('date', 'desc')
      .where('creator','==',firstname)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate))
      .get();

    let factureList: Facture[] = [];
    let index = 0;
    await factures.subscribe(snapshot => { 
      snapshot.forEach(doc => {
        factureList.push(doc.data() as Facture);
        factureList[index].date = (doc.data() as any).date.toDate();
        index++;
      });
    });
    return factureList;
  }

  async getFactures(startDate : Date, endDate : Date) 
  {
    const factures = await this.afs.collection<Facture>('factures', ref => 
      ref.orderBy('date', 'desc')
      .where('date', '>=', startDate)
      .where('date', '<=', endDate))
      .get();
    let factureList: Facture[] = [];
    let index = 0;
    await factures.subscribe(snapshot => { 
      snapshot.forEach(doc => {
        factureList.push(doc.data() as Facture);
        factureList[index].date = (doc.data() as any).date.toDate();
        factureList[index].factureId = doc.id;
        index++;
      });
    });
    return factureList;
  }

  async getFacture(id: string) : Promise<Facture>
  {
    const doc = await this.afs.collection('factures').doc(id).ref.get();
    return (await doc.data()) as Facture;
  }

  async addFacture(facture: Facture) {
    let lts: number = await this.getBiggestId();
    if(lts !== facture.factureNumber - 1) {
      return ("Facture number already exists");
    }
    await this.setBiggestId(facture.factureNumber);
    return await this.afs.collection('factures').add(facture);
  }

  updateFacture(id: string, facture: Facture) {
    return this.afs.collection('factures').doc(id).update(facture);
  }

  deleteFacture(id: string) {
    return this.afs.collection('factures').doc(id).delete();
  }

  async getBiggestId() {
    const doc = await this.afs.collection('factureId/').doc('30g0Cz3Kio86t73MOEDS').ref.get();

    this.biggestId = (doc as any).data().factureId;
    return this.biggestId;
  }

  private setBiggestId(id: number) {
    this.afs.collection('factureId/').doc('30g0Cz3Kio86t73MOEDS').update({ factureId: id });
  }
}

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import firebase from 'firebase/compat/app';
import { getAuth, signOut } from "firebase/auth";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {

  user$: Observable<User | null | undefined>;

  userTemporary: User = {
    uid: '',
    email: '',
    firstname: '',
    name: '',
    role: 'user',
    password: ''
  };


  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore, private router: Router) {
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        }
        else {
          return of(null);
        }
      })
    );
  }

  async signup(signupParameters: User)
  {
    firebase.auth().createUserWithEmailAndPassword(signupParameters.email, signupParameters.password).then
    ((userCredential: any) => {
      const data = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        firstname: signupParameters.firstname,
        name: signupParameters.name,
        password: 'Signed by Adrien Colombier'
      };
      return this.updateUserData(data);
    })
  }

  async checkIsLoggedIn()
  {
    if (!(firebase.auth().currentUser || localStorage.getItem("firstname")))
    {
      alert('Vous devez vous connecter pour accéder à cette page');
      this.router.navigate(['sign']);
    }
  }

  async SignOut()
  {
    const auth = getAuth();
    signOut(auth).then(() =>
    {
      this.router.navigate(['sign']);
      localStorage.clear();
      console.log('SignOut');
    }).catch((error) => {
      console.log(error.message);
    });
  }

  async getUser(id: string) {
    const doc = await this.afs.collection('users').doc(id).ref.get();
    return await doc.data();
  }

  async signin(signinParameters: User)
  {
    firebase.auth().signInWithEmailAndPassword(signinParameters.email, signinParameters.password).then
    (async ( userCredential) => {
      console.log(userCredential);
      let userId = (userCredential as any).user.uid;
      let user = await this.getUser(userId);
      console.log(user);
      localStorage.setItem('uid', userId);
      localStorage.setItem('firstname', (user as any).firstname);
      localStorage.setItem('lastname', (user as any).name);
      localStorage.setItem('userMail', (user as any).email);
      localStorage.setItem('signature', (user as any).signature);
      localStorage.setItem('role', (user as any).role);
      this.router.navigate(['factures']);
      return userCredential;
    })
  }

  private updateUserData(user: any)
  {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

    const data = {
      uid: user.uid,
      email: user.email,
      firstname: this.userTemporary.firstname,
      name: this.userTemporary.name,
      role: this.userTemporary.role,
      password: 'Signed by Adrien Colombier'
    }

    localStorage.setItem('uid', user);
    localStorage.setItem('firstname', user.firstname);
    localStorage.setItem('userMail', user.email);

    this.router.navigate(['factures']);
    return userRef.set(data, { merge : true });
  }
}

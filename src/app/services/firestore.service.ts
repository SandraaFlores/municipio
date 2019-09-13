import { Injectable } from '@angular/core';
import {AngularFirestore, AngularFirestoreModule} from '@angular/fire/firestore';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    private firestore: AngularFirestore
  ) {}

  public createUser(data: {nombre: string, cabecera: string, superficie: string,
    altitud: string, clima: string, latitud: string, longitud: string, significado: string, desastre: string}) {
    return this.firestore.collection('user').add(data);
  }

  public getUser(documentId: string) {
    return this.firestore.collection('user').doc(documentId).snapshotChanges();
  }

  public getUsers() {
    return this.firestore.collection('user').snapshotChanges();
  }
  // update user
  public updateUser(user, data: any) {
    return this.firestore.collection('user').doc(user.id).set(data);
  }

  public deleteUser(user) {
    return  this.firestore.collection('user').doc(user.id).delete();
  }
}

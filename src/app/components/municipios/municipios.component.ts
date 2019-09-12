import {Component, OnInit, ViewChild} from '@angular/core';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {FirestoreService} from '../../services/firestore.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-municipios',
  templateUrl: './municipios.component.html',
  styleUrls: ['./municipios.component.css']
})
export class MunicipiosComponent implements OnInit {
  public users = [];
  public user;
  public documentId = null;
  public currentStatus = 1;
  public newMunicipioForm;
  // @ts-ignore
  @ViewChild('exampleModal') private modal;
  // @ts-ignore
  @ViewChild('alertSwal') private alertSwal: SwalComponent;

  constructor(private firestoreService: FirestoreService,
              private modalService: NgbModal) {
    this.newMunicipioForm = new FormGroup({
      nombre: new FormControl('', Validators.required),
      cabecera: new FormControl('', Validators.required),
      superficie: new FormControl('', Validators.required),
      altitud: new FormControl('', Validators.required),
      id: new FormControl(''),
      clima: new FormControl('', Validators.required),
      latitud: new FormControl('', Validators.required),
      longitud: new FormControl('', Validators.required),
      significado: new FormControl('', Validators.required),
    });
    this.newMunicipioForm.setValue({
      id: '',
      nombre: '',
      cabecera: '',
      superficie: '',
      altitud: '',
      clima: '',
      latitud: '',
      longitud: '',
      significado: ''
    });
  }

  ngOnInit() {
    this.firestoreService.getUsers().subscribe((usersSnapshot) => {
      this.users = [];
      usersSnapshot.forEach((userData: any) => {
        this.users.push({
          id: userData.payload.doc.id,
          data: userData.payload.doc.data()
        });
      });
    });
  }

  public openModal(content, newMunicipioForm, user = null) {
    this.user = user;
    this.currentStatus = 1;
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'})
      .result.then((result) => {
      this.resetForm();
    }, (reason) => {
      this.resetForm();
    });
    if (user != null) {
      this.newMunicipioForm.setValue({
        nombre: user.data.nombre,
        cabecera: user.data.cabecera,
        superficie: user.data.superficie,
        altitud: user.data.altitud,
        id: user.id,
        clima: user.data.clima,
        latitud: user.data.latitud,
        longitud: user.data.longitud,
        significado: user.data.significado
      });
      this.currentStatus = 2;
    }
  }

  public delete(user) {
    this.firestoreService.deleteUser(user);
  }

  public update(user, data) {
    this.firestoreService.updateUser(this.user, data).then(() => {
      this.resetForm();
      this.alertSwal.title = 'Correcto';
      this.alertSwal.type = 'success';
      this.alertSwal.text = 'Usuario modificado';
      this.alertSwal.fire();
      this.modalService.dismissAll();
      this.user = null;
    }, (error) => {
    });
  }
  public newUser(data) {
    this.firestoreService.createUser(data).then(() => {
      this.resetForm();
      this.alertSwal.title = 'Correcto';
      this.alertSwal.type = 'success';
      this.alertSwal.text = 'Usuario agregado';
      this.alertSwal.fire();
      this.modalService.dismissAll();
    }, (error) => {
    });
  }

  public upsert(form) {
    const data = {
      nombre: form.nombre,
      cabecera: form.cabecera,
      superficie: form.superficie,
      altitud: form.altitud,
      clima: form.clima,
      latitud: form.latitud,
      longitud: form.longitud,
      significado: form.significado
    };

    if (this.currentStatus === 1) {
      this.newUser(data);
    } else {
      this.update(this.user, data);
    }
  }

  public resetForm() {
    this.newMunicipioForm.setValue({
      nombre: '',
      cabecera: '',
      superficie: '',
      altitud: '',
      id: '',
      clima: '',
      latitud: '',
      longitud: '',
      significado: ''
    });
  }

}

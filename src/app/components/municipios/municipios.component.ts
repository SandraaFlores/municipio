import {Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {FirestoreService} from '../../services/firestore.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MapsAPILoader, MouseEvent} from '@agm/core';

@Component({
  selector: 'app-municipios',
  templateUrl: './municipios.component.html',
  styleUrls: ['./municipios.component.css']
})
export class MunicipiosComponent implements OnInit {
  title: string;
  latitude = 20.7999062;
  longitude = -105.1031638;
  zoom = 5.27;
  address: string;
  private geoCoder;
  filterMun = '';
  filterIGECEM = '';
  filterZona = '';


  public users = [];
  public user;
  climas = new FormControl();
  desastre = new FormControl();
  tiposClimas: string[] = ['Cálido', 'Semiárido', 'Seco', 'Templado', 'Semifrío', 'Frío'];
  tiposDesastres: string[] = ['Inundación', 'Deslave', 'Zona sísmica', 'Incendio forestal', 'Zona volcánica', 'Derrumbes'];
  public documentId = null;
  public currentStatus = 1;
  public newMunicipioForm;
  // @ts-ignore
  @ViewChild('exampleModal') private modal;
  // @ts-ignore
  @ViewChild('alertSwal') private alertSwal: SwalComponent;


  constructor(private firestoreService: FirestoreService,
              public modalService: NgbModal, private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone) {
    this.newMunicipioForm = new FormGroup({
      igecem: new FormControl('', Validators.required),
      nombre: new FormControl('', Validators.required),
      cabecera: new FormControl('', Validators.required),
      superficie: new FormControl('', Validators.required),
      altitud: new FormControl('', Validators.required),
      id: new FormControl(''),
      clima: new FormControl('', Validators.required),
      latitud: new FormControl(''),
      longitud: new FormControl(''),
      significado: new FormControl('', Validators.required),
      desastre: new FormControl('', Validators.required)
    });
    this.newMunicipioForm.setValue({
      igecem: '',
      id: '',
      nombre: '',
      cabecera: '',
      superficie: '',
      altitud: '',
      clima: '',
      latitud: '',
      longitud: '',
      significado: '',
      desastre: ''
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
        igecem: user.data.igecem,
        nombre: user.data.nombre,
        cabecera: user.data.cabecera,
        superficie: user.data.superficie,
        altitud: user.data.altitud,
        id: user.id,
        clima: user.data.clima,
        latitud: user.data.latitud,
        longitud: user.data.longitud,
        significado: user.data.significado,
        desastre: user.data.desastre
      });
      this.latitude = user.data.latitud;
      this.longitude = user.data.longitud;
      this.zoom = 10;
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
    let bandera = true;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].data.nombre === data.nombre) {
        bandera = false;
        break;
      }
    }
    if (bandera) {
      this.firestoreService.createUser(data).then(() => {
        this.resetForm();
        this.alertSwal.title = '¡Correcto!';
        this.alertSwal.type = 'success';
        this.alertSwal.text = 'Municipio agregado';
        this.alertSwal.fire();
        this.modalService.dismissAll();
      }, (error) => {
      });
    } else {
      this.resetForm();
      this.alertSwal.title = '¡Error!';
      this.alertSwal.type = 'error';
      this.alertSwal.text = 'El municipio ' + data.nombre + ' ya existe.';
      this.alertSwal.fire();
      this.modalService.dismissAll();
    }
  }

  public upsert(form) {
    const data = {
      igecem: form.igecem,
      nombre: form.nombre,
      cabecera: form.cabecera,
      superficie: form.superficie,
      altitud: form.altitud,
      clima: form.clima,
      latitud: this.latitude,
      longitud: this.longitude,
      significado: form.significado,
      desastre: form.desastre
    };

    if (this.currentStatus === 1) {
      this.newUser(data);
    } else {
      this.update(this.user, data);
    }
  }

  public resetForm() {
    this.newMunicipioForm.setValue({
      igecem: '',
      nombre: '',
      cabecera: '',
      superficie: '',
      altitud: '',
      id: '',
      clima: '',
      latitud: '',
      longitud: '',
      significado: '',
      desastre: ''
    });
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.latitude, this.longitude);
      });
    }
  }


  markerDragEnd($event: MouseEvent) {
    console.log($event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;

  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({location: {lat: latitude, lng: longitude}}, (results, status) => {
      console.log(results);
      console.log(status);
      if (status === 'OK') {
        if (results[0]) {
          this.zoom = 12;
          this.address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }

  mapClicked(event: MouseEvent) {
    this.latitude = event.coords.lat;
    this.longitude = event.coords.lng;
    console.log('hjnkl');
  }

}

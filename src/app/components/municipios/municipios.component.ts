import {Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';
import {FirestoreService} from '../../services/firestore.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import * as mun from 'src/json_mun/mun.json';
@Component({
  selector: 'app-municipios',
  templateUrl: './municipios.component.html',
  styleUrls: ['./municipios.component.css']
})
export class MunicipiosComponent implements OnInit {
  title: string;
  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;

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
  // @ts-ignore
  @ViewChild('search', { static: false }) searchElementRef: ElementRef;

  constructor(private firestoreService: FirestoreService,
              private modalService: NgbModal, private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone) {
    this.newMunicipioForm = new FormGroup({
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

    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder();

      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ['address']
      });
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {

          const place: google.maps.places.PlaceResult = autocomplete.getPlace();

          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
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
        significado: user.data.significado,
        desastre: user.data.desastre
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
    let bandera = true;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].data.nombre == data.nombre) {
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
      this.alertSwal.text = 'El municipio ' + data.nombre + ' ya existe';
      this.alertSwal.fire();
      this.modalService.dismissAll();
    }
  }

  public upsert(form) {
    const data = {
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
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
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

}

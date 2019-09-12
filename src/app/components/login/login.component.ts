import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {FormControl} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {SwalComponent} from '@sweetalert2/ngx-sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  formLogin;
  // @ts-ignore
  @ViewChild('alertSwal') private alertSwal: SwalComponent;

  constructor(
    private authService: AuthService,
    private route: Router) {
    this.formLogin = new FormGroup(
      {
        email: new FormControl(''),
        password: new FormControl('')
      });
  }

  ngOnInit() {
  }

  onSubmit(customerData) {
    this.authService.login(customerData.email, customerData.password).then(r => {
      this.alertSwal.title = 'Correcto';
      this.alertSwal.type = 'success';
      this.alertSwal.text = 'Bienvenido';
      this.alertSwal.fire();
    }).catch(error => {
      console.log(error);
      console.log(this.alertSwal);
      this.alertSwal.title = 'Error';
      this.alertSwal.type = 'error';
      this.alertSwal.text = 'Usuario o contraseña incorrecta';
      this.alertSwal.fire();
    });
  }
}


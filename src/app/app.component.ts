import {Component} from '@angular/core';
import {AuthService} from './services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'municipio';
  authUser = null;

  constructor(private authService: AuthService,
              private route: Router) {
    authService.getUserAuth().subscribe((auth) => {
      this.authUser = auth;
    });
  }

  logout() {
    this.authService.logout();
  }

}

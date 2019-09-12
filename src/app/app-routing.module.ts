import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {MunicipiosComponent} from './components/municipios/municipios.component';




const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'municipio', component: MunicipiosComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password.component';

const routes: Routes = [
  { path: '', component: ForgotPasswordComponent }
];

@NgModule({
  imports: [
    CommonModule,
    ForgotPasswordComponent,
    RouterModule.forChild(routes)
  ]
})
export class ForgotPasswordModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvitePage } from './invite.page';
import { DirectivesModule } from 'src/app/directives/directives.module';

const routes: Routes = [
  {
    path: '',
    component: InvitePage
  },
  {
    path: ':id',
    component: InvitePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    DirectivesModule
  ],
  declarations: [InvitePage]
})
export class InvitePageModule {}

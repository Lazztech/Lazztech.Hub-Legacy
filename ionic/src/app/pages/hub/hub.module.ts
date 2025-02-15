import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

// Import the package's module
import { NgxKjuaModule } from 'ngx-kjua';

import { IonicModule } from '@ionic/angular';

import { HubPage } from './hub.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { DirectivesModule } from 'src/app/directives/directives.module';

const routes: Routes = [
  {
    path: '',
    component: HubPage
  },
  {
    path: ':id',
    component: HubPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxKjuaModule,
    ComponentsModule,
    DirectivesModule
  ],
  declarations: [HubPage]
})
export class HubPageModule {}

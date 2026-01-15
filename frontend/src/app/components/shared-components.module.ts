/**
 * Shared Module - Componentes reutilizables
 * 
 * Exporta componentes compartidos como EntityAutocomplete
 * para ser usados en módulos lazy-loaded.
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Componentes compartidos
import { EntityAutocompleteComponent } from './entity-autocomplete/entity-autocomplete.component';

@NgModule({
  declarations: [
    EntityAutocompleteComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  exports: [
    EntityAutocompleteComponent
  ]
})
export class SharedComponentsModule { }

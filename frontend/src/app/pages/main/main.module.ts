import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Angular Material
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Components
import { MainLayoutComponent } from './main-layout.component';
import { EntriesComponent } from './entries/entries.component';
import { ChecklistComponent } from './checklist/checklist.component';
import { AllEntriesComponent } from './all-entries/all-entries.component';
import { ReportsComponent } from './reports/reports.component';
import { UsersComponent } from './users/users.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './profile/profile.component';
import { MyEntriesComponent } from './my-entries/my-entries.component';
import { TagsComponent } from './tags/tags.component';
import { LogoComponent } from './logo/logo.component';
import { BackupComponent } from './backup/backup.component';

// Guards
import { NotGuestGuard } from '../../guards/not-guest.guard';
import { AdminGuard } from '../../guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'entries', pathMatch: 'full' },
      { path: 'entries', component: EntriesComponent },
      { path: 'my-entries', component: MyEntriesComponent },
      { path: 'checklist', component: ChecklistComponent },
      { path: 'all-entries', component: AllEntriesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'tags', component: TagsComponent },
      { path: 'logo', component: LogoComponent },
      { path: 'backup', component: BackupComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];

@NgModule({
  declarations: [
    MainLayoutComponent,
    EntriesComponent,
    ChecklistComponent,
    ReportsComponent,
    UsersComponent,
    SettingsComponent,
    ProfileComponent,
    MyEntriesComponent,
    TagsComponent,
    LogoComponent,
    BackupComponent
    // AllEntriesComponent es standalone, va solo en imports
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatTooltipModule,
    MatDividerModule,
    AllEntriesComponent
  ]
})
export class MainModule { }

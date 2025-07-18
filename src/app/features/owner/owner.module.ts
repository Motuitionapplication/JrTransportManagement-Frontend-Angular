import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OwnerComponent } from './owner.component';

@NgModule({
  declarations: [OwnerComponent],
  imports: [CommonModule],
  exports: [OwnerComponent]
})
export class OwnerModule {}

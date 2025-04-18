import {ChangeDetectionStrategy, Component} from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

@Component({
  selector: 'ppt-form',
  templateUrl: './ppt-form.component.html',
  styleUrl: './ppt-form.component.scss',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PPTFormComponent {

}

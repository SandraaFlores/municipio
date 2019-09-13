import { Component, OnInit } from '@angular/core';
import { FormControl} from '@angular/forms';

@Component({
  selector: 'app-select-multiple',
  templateUrl: './select-multiple.component.html',
  styleUrls: ['./select-multiple.component.css']
})
export class SelectMultipleComponent implements OnInit {
  climas = new FormControl();
  tiposClimas: string[] = ['Cálido', 'Semiárido', 'Seco', 'Templado', 'Semifrío', 'Frío'];
  constructor() { }

  ngOnInit() {
  }

}

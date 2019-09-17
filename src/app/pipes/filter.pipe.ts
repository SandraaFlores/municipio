import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(value: any, args: any): any {
    const result = [];
    for (const user of value) {
      if (user.data.nombre.toLowerCase().indexOf(args.toLowerCase()) > -1) {
        result.push(user);
      }
    }
    return result;
  }

}

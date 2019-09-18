import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(value: any, args: any): any {
    const result = [];
    for (const user of value) {
      try {
        // tslint:disable-next-line:triple-equals
        if ((user.data.nombre.toLowerCase().indexOf(args[0].toLowerCase()) > -1 && args[1] == '' && args[2] == '') ||
          ((user.data.igecem + '').indexOf(args[1].toLowerCase()) > -1 && args[0] == '' && args[2] == '') ||
          (args[0] == '' && args[1] == '')
        ) {
          if (args[2] == '') {
            result.push(user);
          } else {
            for (const zonaMun of user.data.desastre) {
              if ((zonaMun.toLowerCase()).indexOf(args[2].toLowerCase()) > -1) {
                result.push(user);
              }
            }
          }
        }
      } catch (e) {
        console.error('Error' + e);
      }
    }
    return result;
  }
}

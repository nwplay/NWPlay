import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime'
})
export class PlayerTimePipe implements PipeTransform {
  transform(value: number): string {
    return this.formatTime(value);
  }

  // noinspection JSMethodCanBeStatic
  private formatTime(seconds) {
    const hh = Math.floor(seconds / 3600);
    const mm = Math.floor(seconds / 60) % 60;
    const ss = Math.floor(seconds) % 60;
    return (
      (hh ? (hh < 10 ? '0' : '') + hh + ':' : '') + (mm < 10 && hh ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss
    );
  }
}

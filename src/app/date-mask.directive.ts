import {Directive, ElementRef, OnDestroy} from '@angular/core';
import * as textMask from 'vanilla-text-mask/dist/vanillaTextMask.js';

@Directive({
  selector: '[appDateMask]'
})
export class DateMaskDirective implements OnDestroy {
  mask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];
  maskedInputController;

  constructor(private element: ElementRef) {
    this.maskedInputController = textMask.maskInput({
      inputElement: this.element.nativeElement,
      mask: this.mask
    });
  }

  ngOnDestroy() {
    this.maskedInputController.destroy();
  }

}

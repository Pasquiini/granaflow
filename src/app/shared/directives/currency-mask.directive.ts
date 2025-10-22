import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Input
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[currencyMask]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyMaskDirective),
      multi: true,
    },
  ],
})
export class CurrencyMaskDirective implements ControlValueAccessor {
  @Input() locale: string = 'pt-BR';
  @Input() currency: string = 'BRL';
  @Input() allowNegative = false;

  private el: HTMLInputElement;
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef<HTMLInputElement>) {
    this.el = elementRef.nativeElement;
    this.el.inputMode = 'decimal';
  }

  writeValue(value: number | null): void {
    this.el.value = value != null ? this.format(value) : '';
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.el.disabled = isDisabled; }

  @HostListener('input', ['$event'])
  onInput(event: InputEvent) {
    const prevValue = this.el.value;
    const caret = this.el.selectionStart ?? prevValue.length;

    const numeric = this.parse(prevValue);
    const formatted = numeric != null ? this.format(numeric) : '';

    // calcula diferença de tamanho
    const diff = formatted.length - prevValue.length;

    // reatribui valor
    this.el.value = formatted;

    // ajusta cursor sem sempre jogar pro final
    let newCaret = caret + diff;
    if (newCaret < 0) newCaret = 0;
    if (newCaret > formatted.length) newCaret = formatted.length;
    requestAnimationFrame(() =>
      this.el.setSelectionRange(newCaret, newCaret)
    );

    this.onChange(numeric);
  }

  @HostListener('blur')
  onBlur() { this.onTouched(); }

  private format(value: number): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  private parse(str: string): number | null {
    if (!str) return null;
    const negative = this.allowNegative && /-/.test(str);
    const digits = str.replace(/[^\d]/g, '');
    if (!digits) return 0;
    let num = parseInt(digits, 10) / 100;
    if (negative) num = -num;
    return num;
  }
}

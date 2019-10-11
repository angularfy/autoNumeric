/**
 * @author Abdelghani AINOUSS
 */

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {NgAutonumericOptionsSelect} from './autonumeric-options-select';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import AutoNumeric from 'autonumeric';
import {BasicInput} from './basic-input';

@Component({
  selector: 'ng-autonumeric',
  templateUrl: './autonumeric.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NgAutonumericComponent),
    multi: true
  }],
  encapsulation: ViewEncapsulation.None
})
export class NgAutonumericComponent extends BasicInput implements OnInit, OnChanges, ControlValueAccessor, AfterViewInit, OnDestroy {

  @Input()
  options: NgAutonumericOptionsSelect;
  @Input()
  type: string;
  @ViewChild('input')
  input: ElementRef;
  instance: any;
  unlistenFormatted: () => void;
  internal: string;
  @Output()
  format = new EventEmitter();
  _onChange = (_) => {
  };
  _onTouched = () => {
  };

  constructor(private cd: ChangeDetectorRef, private renderer: Renderer2) {
    super();
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    if (AutoNumeric === undefined) {
      throw "AutoNumeric is a peer dependency, please make sure you install it before using this library. Hint : npm install --save autonumeric@latest";
    }
    this.instance = new AutoNumeric(this.input.nativeElement, this.options);
    this.instance.set(this.internal);
    this.unlistenFormatted = this.renderer.listen(this.input.nativeElement, 'autoNumeric:formatted', ($event) => {
      this.format.emit($event);
      if (this.instance.getNumber()) {
        this._onChange(this.instance.getNumber());
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.instance) {
      return;
    }
    if (changes.options) {
      this.instance.update(this.options);
    }
  }

  set(value) {
    if (this.instance) {
      this.instance.set(value);
    } else throw 'NgAutonumeric instance not available. try using two binding by providing [(ngModel)]';
  }

  @HostListener('change', ['$event.target.value'])
  handleChange(value) {
    if (this.instance) {
      value = this.instance.getNumber();
    }
    this._onChange(value);
  }

  @HostListener('blur')
  handleTouched() {
    this._onTouched();
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(obj: any): void {
    this.internal = obj;
    if (this.instance) {
      this.instance.set(obj);
    }
  }

  ngOnDestroy(): void {
    if (this.unlistenFormatted)
      this.unlistenFormatted();
  }
}

import {ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css'],
})
export class ProgressComponent implements OnInit, OnChanges {

  @ViewChild('parent', {static: true})
  parent: ElementRef<HTMLElement>;

  @Input()
  value = 0;

  @Input()
  targets = [];

  @Input()
  max = 1;

  @Input()
  color = '#334455';

  barColor = '#fefefe';

  totalWidth = 0;
  barWidth: number;

  progressPct = '';

  private loaded = false;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.updateScreen();
    setTimeout(() => {
      this.loaded = true;
      this.updateScreen();
    }, 100);

    window.addEventListener('resize', () => {
      this.updateScreen();
    });
  }

  updateScreen(): void {
    const value = this.loaded ? this.value : 0;
    this.totalWidth = this.parent.nativeElement.offsetWidth;
    this.barWidth = this.totalWidth * (value / this.max);
    this.progressPct = ((value / this.max) * 100).toFixed(2) + '%';
    this.barColor = this.color;
    for (const target of this.targets) {
      if (value > target.value) {
        this.barColor = target.color;
      }
    }
    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateScreen();
  }

}

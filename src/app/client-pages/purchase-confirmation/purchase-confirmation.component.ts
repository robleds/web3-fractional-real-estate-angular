import {Component, OnInit} from '@angular/core';
import {AssetsService} from '../../services/assets.service';
import {faAward} from '@fortawesome/free-solid-svg-icons/faAward';
import {faSmile} from '@fortawesome/free-regular-svg-icons/faSmile';

@Component({
  selector: 'app-purchase-confirmation',
  templateUrl: './purchase-confirmation.component.html',
  styleUrls: ['./purchase-confirmation.component.css']
})
export class PurchaseConfirmationComponent implements OnInit {
  faAward = faAward;
  faSmile = faSmile;

  constructor(public assetsService: AssetsService) {
  }

  ngOnInit(): void {
  }

}

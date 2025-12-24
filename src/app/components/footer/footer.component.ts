import { Component, OnInit } from '@angular/core';
import {faInstagram} from '@fortawesome/free-brands-svg-icons/faInstagram';
import {faFacebook} from '@fortawesome/free-brands-svg-icons/faFacebook';
import {faLinkedin} from '@fortawesome/free-brands-svg-icons/faLinkedin';
import {faTwitter} from '@fortawesome/free-brands-svg-icons/faTwitter';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  icons = {
    solid: {
      instagram: faInstagram,
      facebook: faFacebook,
      linkedin: faLinkedin,
      twitter: faTwitter
    }
  };

  constructor() { }

  ngOnInit(): void {
  }

}

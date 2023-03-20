import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css']
})

export class SignComponent implements OnInit {

  email: string = "";
  password: string = "";
  user: User = {email: "", firstname: "", name: "", password: "", uid: "", role: "user"};

  constructor(public auth: AuthenticationService) { }

  ngOnInit(): void { }

  signIn()
  {
    this.auth.signin(this.user)
  }

}

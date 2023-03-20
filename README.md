# InvoiceManager
Step 1 - Create a folder "config" at the root with 3 files:
- emailjs.json  containing your information =>
{
  "publicKey" : "xxxxxxxxxxxxxxxxx",
  "defaultUserName" : "user",
  "companyName" : "cmp",
  "serviceId": "xxxxxxxxx",
  "templateId" : "template_x",
  "templateIdPro" : "template_x_pro"
}

- firebase.json containing your information =>
{
  "apiKey" : "xxxxxxxxxxxxxxx-xxxxxxx",
  "authDomain" : "xxxxxxxx.firebaseapp.com",
  "projectId" : "xxxxxxxxxx",
  "storageBucket" : "xxxxxxxxxx.appspot.com",
  "messagingSenderId" : "xxxxxxxxxxx",
  "appId" : "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "measurementId" : "G-xxxxxxxxxxx" (optional)
}

- invoiceData.json  containing your information =>
{
  "noticeLegal" : "",
  "footer1" : "",
  "footer2" : "",
  "companyName": "Company 1"
}

Step 2 - install node

Step 3 - run those commands
- npm install -g @angular slash cli
- npm install -g firebase-tools
- (CMD windows if needed) Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned

Step 4 - add your own images 
- /src/assets/img/cachet_entreprise.png
- /src/assets/img/logo_entreprise.png

Step 5 - Setup & deploy on firebase

- firebase login
- firebase init
- add "site": "projectname" in firebase.json
- firebase use projectName  (optional)
- ng build
- move content from public/* to dist/projectName/*
- firebase deplay --only hosting:projectname

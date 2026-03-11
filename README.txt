1. Kør npm install for dependencies
2. username, password og email sættes i data/users.json
    - nuværende er "batman", "123" og jeppedamsgaard92@gmail.com
3. Serveren afsender en email, så du skal have din egen .env med din egen email (den er sat op til gmail) og app-kode
    - For at lave .env, bash:    touch .env
        - den fil kan du se i vscode. I den fil, opret indhold (udgift din_gmail@gmail.com og din_app_password):

            EMAIL_USER=din_gmail@gmail.com
            EMAIL_PASS=din_app_password

    - hvis du ikke har et app password, så lav det her: https://myaccount.google.com/apppasswords 
        - du skal have sat din gmail op til 2F login for at det virker, men det har I formegentlig.
        - det app-password skal indsættes uden mellemrum.

4. Kør serveren med node server.js

OBS: den .env indeholder adgangsgivende information til din email, så den fil må IKKE lægge tilgængeligt online.


Læs pdf for mere info om projektet.
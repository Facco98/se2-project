# Progetto di Ingegneria del Software 2 @ UniTN

### Componenti del gruppo
 1. Facchinetti Claudio ( @Facco98 ) - 193588
 2. Guixia Zhu ( @Zhugxz ) - 193378
 3. Francesco Arrighi ( @arrighi79 ) - 194034
 4. Federica Ress ( @federicaress ) - 195172
 5. Federica Belotti (@FedericaBelotti) - 193872

### Installare i componenti
Dopo aver clonato la repository, bisogna installare i componenti necessari.
 - #### Installare le dipendenze  
 E' possibile installare le dipendenze del progetto semplicemente lanciando il comando `npm install`

 - #### Creare il database `se2proj`
 Per eseguire il progetto è necessario installare il database PostgreSQL; per fare questo si rimanda al gestore di pacchetti del proprio sistema.

 Per caricare il database sono possibili due modi:  
  1. Creare il database a mano e copia-incollare il contenuto del fine `sql/install.sql` che contiene le query.

  2. Lanciare il comando `npm run installDB` se si è in ambiente Unix-like ( Linux e macOS ) oppure `npm run installDB-Win` se si è in ambiente Windows.  
    **Attenzione**: Al fine di usare questo metodo ci si assicuri che il comando `psql` sia accessibile dall'utente corrente e che sia garantito l'accesso al database utilizzando tale utente. Questo può essere fatto su Linux con il comando `sudo -u postgres createuser -s $USER`; questo non dovrebbe essere necessario su macOS nel caso in cui PostgreSQL sia stato installato tramite Homebrew.

  Per consentire la connessione al database e' necessario creare le variabili d'ambiente di PostgreSQL:
    `
    export PGHOST=host
    export PGDATABASE=se2proj
    export PGUSER=user
    export PGPASSWORD=passwordDellUtente
    `
  - #### Creare il segreto per il token
  Affinche il codice funzione e' necessarion fornire un segreto per la gestione dei JSON Web Token, bisogna quindi creare una variabile d'ambiente apposita: ```export TokenSecret=UnTokenSecretInviolabile```
  `

### Lanciare il progetto
Per lanciare il progetto è sufficiente usare il comando `npm start`.

### Deploy su Heroku
Il programma e' deployato al seguente link: [NESTAreas on Heroku](https://nestareas.herokuapp.com). L'applicazione in questione si collega a un database remoto le cui credenziali non sono pubblicate su git per ovvi motivi di sicurezza.

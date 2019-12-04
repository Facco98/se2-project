/*
DROP delle tabelle, se esistono.
*/

DROP TABLE IF EXISTS richiesta;
DROP TABLE IF EXISTS prenotazione;
DROP TABLE IF EXISTS aula;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS utente;


/*
Creazione delle tabelle.
*/
CREATE TABLE utente (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(50) NOT NULL,
    cognome     VARCHAR(50) NOT NULL,
    password    VARCHAR(50) NOT NULL,
    telefono    VARCHAR(15) NOT NULL,
    mail        VARCHAR(50) NOT NULL,
    UNIQUE(mail)
);

CREATE TABLE staff (
    id_utente   SERIAL REFERENCES utente(id) NOT NULL PRIMARY KEY
);

CREATE TABLE aula (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(50) NOT NULL,
    UNIQUE(nome)
);

CREATE TABLE richiesta (
    id          SERIAL PRIMARY KEY,
    id_utente   SERIAL REFERENCES utente(id) NOT NULL,
    id_aula     SERIAL REFERENCES aula(id) NOT NULL,
    motivazione TEXT   NOT NULL,
    inizio      TIMESTAMP NOT NULL,
    durata      INTERVAL NOT NULL
);

CREATE TABLE prenotazione (
    id              SERIAL PRIMARY KEY,
    id_staff        SERIAL REFERENCES staff(id_utente) NOT NULL,
    id_utente   SERIAL REFERENCES utente(id) NOT NULL,
    id_aula     SERIAL REFERENCES aula(id) NOT NULL,
    motivazione TEXT NOT NULL,
    inizio      TIMESTAMP NOT NULL,
    durata      INTERVAL NOT NULL
);

/*
Inserimento dei dati 'fake' all'interno delle tabelle per motivi di test.
*/
INSERT INTO utente(id, nome, cognome, password, telefono, mail) VALUES (0, 'Claudio', 'Facchinetti', 'psw', '1234567890', 'cfacchinetti@example.com'),
(1, 'Luca', 'Nicolli', 'psw', '1234567891', 'lnicolli@example.com'), (2, 'Filippo', 'Spaggiari', 'psw', '1234567891', 'fspaggiari@example.com');
INSERT INTO staff(id_utente) VALUES(1);

INSERT INTO aula(id, nome) VALUES(0, 'Aula studio C'), (1, 'Aula studio B');
INSERT INTO richiesta(id_utente, id_aula, motivazione, inizio, durata) VALUES(2,0,'Tutorato matematica', NOW(), '2 hours');

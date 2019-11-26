DROP TABLE IF EXISTS utente;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS aula;
DROP TABLE IF EXISTS richiesta;
DROP TABLE IF EXISTS prenotazione;

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
    id_richiesta    SERIAL REFERENCES richiesta(id) NOT NULL,
    id_aula         SERIAL REFERENCES aula(id) NOT NULL,
    note            TEXT   NOT NULL,
    inizio          TIMESTAMP NOT NULL,
    duarat          INTERVAL NOT NULL
);

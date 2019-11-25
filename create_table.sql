CREATE TABLE utente (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    cognome     VARCHAR(50) NOT NULL,
    password    VARCHAR(50) NOT NULL,
    telefono    VARCHAR(15) NOT NULL,
    mail        VARCHAR(50) NOT NULL
);

CREATE TABLE staff (
    id_utente   SERIAL REFERENCES utente NOT NULL PRIMARY KEY
);

CREATE TABLE aula (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL
);

CREATE TABLE richiesta (
    id          SERIAL PRIMARY KEY,
    id_utente   SERIAL REFERENCES utente NOT NULL,
    id_aula     SERIAL REFERENCES aula NOT NULL,
    motivazione TEXT   NOT NULL,
    intervallo  INTERVAL NOT NULL
);

CREATE TABLE prenotazione (
    id              SERIAL PRIMARY KEY,
    id_staff        SERIAL REFERENCES staff NOT NULL,
    id_richiesta    SERIAL REFERENCES richiesta NOT NULL,
    id_aula         SERIAL REFERENCES aula NOT NULL,
    note            TEXT   NOT NULL,
    intervallo  INTERVAL NOT NULL
);

CREATE TYPE BOOLEAN as ENUM('True', 'False');

CREATE TABLE Person (

  ID SERIAL NOT NULL,
  Username VARCHAR(255) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  Admin BOOLEAN NOT NULL,
  AccessToken TEXT NOT NULL,
  PRIMARY KEY(ID),
  UNIQUE(Username),
  UNIQUE(AccessToken)

);

CREATE INDEX index_access_token ON  Person(AccessToken);

CREATE TABLE Room (

  Name VARCHAR(255) NOT NULL,
  PRIMARY KEY(Name)

);

// Lokale opslag met expo-sqlite, zodat aankopen bewaard blijven tussen app-sessies.
// SQLite is een bestand op het toestel zelf — er komt geen server aan te pas.

import * as SQLite from "expo-sqlite";
import type { Aankoop, AankoopStatus } from "../types/aankopen";

const DB_NAAM = "trackyourreturn.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  // Eén gedeelde databaseverbinding voor de hele app (lazy geopend bij het eerste gebruik).
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAAM);
  }
  return dbPromise;
}

/** Maakt de tabel aan als die nog niet bestaat. Roep dit één keer aan bij het opstarten van de app. */
export async function initDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS aankopen (
      aankoop_id TEXT PRIMARY KEY NOT NULL,
      gebruiker_id TEXT NOT NULL,
      retailer_id TEXT NOT NULL,
      product_naam TEXT NOT NULL,
      product_categorie TEXT,
      bedrag REAL NOT NULL,
      aankoopdatum TEXT NOT NULL,
      leverdatum TEXT,
      land TEXT NOT NULL,
      status TEXT NOT NULL,
      verwijderd_op TEXT,
      verwijder_reden TEXT,
      berekende_aanmeld_deadline TEXT NOT NULL,
      berekende_verzend_deadline TEXT,
      herinneringen_verstuurd TEXT NOT NULL DEFAULT '[]',
      notities TEXT
    );
  `);
}

// SQLite kent geen array-type; herinneringen_verstuurd slaan we op als JSON-tekst (bv. "[7,3]").
type AankoopRow = Omit<Aankoop, "herinneringen_verstuurd"> & { herinneringen_verstuurd: string };

function rijNaarAankoop(rij: AankoopRow): Aankoop {
  return { ...rij, herinneringen_verstuurd: JSON.parse(rij.herinneringen_verstuurd) };
}

/** Haalt alle aankopen van een gebruiker op, nieuwste eerst. */
export async function haalAankopenOp(gebruikerId: string): Promise<Aankoop[]> {
  const db = await getDb();
  const rijen = await db.getAllAsync<AankoopRow>(
    `SELECT * FROM aankopen WHERE gebruiker_id = ? ORDER BY aankoopdatum DESC`,
    [gebruikerId]
  );
  return rijen.map(rijNaarAankoop);
}

/** Voegt een nieuwe aankoop toe (inclusief de al berekende deadlines). */
export async function voegAankoopToe(aankoop: Aankoop): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO aankopen (
      aankoop_id, gebruiker_id, retailer_id, product_naam, product_categorie,
      bedrag, aankoopdatum, leverdatum, land, status, verwijderd_op, verwijder_reden,
      berekende_aanmeld_deadline, berekende_verzend_deadline, herinneringen_verstuurd, notities
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      aankoop.aankoop_id,
      aankoop.gebruiker_id,
      aankoop.retailer_id,
      aankoop.product_naam,
      aankoop.product_categorie,
      aankoop.bedrag,
      aankoop.aankoopdatum,
      aankoop.leverdatum,
      aankoop.land,
      aankoop.status,
      aankoop.verwijderd_op,
      aankoop.verwijder_reden,
      aankoop.berekende_aanmeld_deadline,
      aankoop.berekende_verzend_deadline,
      JSON.stringify(aankoop.herinneringen_verstuurd),
      aankoop.notities,
    ]
  );
}

/** Zet een aankoop op "handmatig_verwijderd" — het record blijft bestaan, alleen de status verandert. */
export async function verwijderAankoopHandmatig(
  aankoopId: string,
  reden: string | null,
  verwijderdOp: string
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE aankopen SET status = 'handmatig_verwijderd', verwijderd_op = ?, verwijder_reden = ? WHERE aankoop_id = ?`,
    [verwijderdOp, reden, aankoopId]
  );
}

/** Zet een status terug, bv. wanneer de gebruiker een handmatige verwijdering ongedaan maakt. */
export async function werkStatusBij(aankoopId: string, status: AankoopStatus): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE aankopen SET status = ?, verwijderd_op = NULL, verwijder_reden = NULL WHERE aankoop_id = ?`,
    [status, aankoopId]
  );
}

/** Markeert alle actieve aankopen waarvan de aanmelddeadline is gepasseerd als "verlopen". Draai dit bij het opstarten van de app. */
export async function markeerVerlopenAankopen(vandaag: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE aankopen SET status = 'verlopen' WHERE status = 'actief' AND berekende_aanmeld_deadline < ?`,
    [vandaag]
  );
}

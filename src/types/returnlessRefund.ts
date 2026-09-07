// Types voor de algemene terugvalregels uit returnless-refund-regels.md.
// Deze gelden alleen als er GEEN retailer-specifieke indicatie bestaat (zie retourbeleid.ts).

export type Waarschijnlijkheid = "hoog" | "middel" | "laag";
export type AlgemeneRegelBronType = "branche_inschatting" | "onbevestigd";

export interface AlgemeneRegel {
  regel_id: string;
  max_bedrag: number | null; // regel geldt tot en met dit bedrag
  categorieën: string[]; // moet overeenkomen met product_categorie op de aankoop
  waarschijnlijkheid: Waarschijnlijkheid;
  toelichting: string;
  bron_type: AlgemeneRegelBronType;
}

export interface ReturnlessRefundRegels {
  algemene_regels: AlgemeneRegel[];
  let_op: string;
}

// Wat de app uiteindelijk aan de gebruiker toont: nooit als zekerheid, altijd als inschatting.
export type ReturnlessRefundNiveau = "vrij_zeker" | "inschatting" | "indicatief";

export interface ReturnlessRefundResultaat {
  niveau: ReturnlessRefundNiveau;
  waarschijnlijkheid: Waarschijnlijkheid;
  toelichting: string;
}

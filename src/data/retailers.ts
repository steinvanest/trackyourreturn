// Typed toegang tot retourbeleid-data.json, zodat de rest van de app niet zelf met ruwe JSON hoeft te werken.

import ruweData from "./retourbeleid-data.json";
import type { RetourbeleidData, Retailer } from "@/types/retourbeleid";

export const retourbeleidData = ruweData as RetourbeleidData;

export const alleRetailers: Retailer[] = retourbeleidData.retailers;

export function vindRetailer(retailerId: string): Retailer | undefined {
  return alleRetailers.find((r) => r.retailer_id === retailerId);
}

/**
 * Unit Conversion Utilities
 * Converts between different unit types for inventory management
 */

export type UnitType = 
  | "kg" | "grams" | "g" | "gm"
  | "l" | "liters" | "ml"
  | "pieces" | "pcs" | "pc"
  | "tsp" | "tbsp" | "cup"
  | string;

/**
 * Normalize unit string to standard format
 */
export function normalizeUnit(unit: string): string {
  const normalized = unit.toLowerCase().trim();
  
  // Weight conversions
  if (normalized === "g" || normalized === "gm") return "grams";
  if (normalized === "kg" || normalized === "kilogram") return "kg";
  
  // Volume conversions
  if (normalized === "l" || normalized === "liter" || normalized === "litre") return "liters";
  if (normalized === "ml" || normalized === "milliliter" || normalized === "millilitre") return "ml";
  
  // Count conversions
  if (normalized === "pcs" || normalized === "pc") return "pieces";
  
  // Return as-is if already normalized or unknown
  return normalized;
}

/**
 * Check if two units are compatible (same type)
 */
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  const u1 = normalizeUnit(unit1);
  const u2 = normalizeUnit(unit2);
  
  // Same unit
  if (u1 === u2) return true;
  
  // Weight units
  const weightUnits = ["kg", "grams"];
  if (weightUnits.includes(u1) && weightUnits.includes(u2)) return true;
  
  // Volume units
  const volumeUnits = ["liters", "ml"];
  if (volumeUnits.includes(u1) && volumeUnits.includes(u2)) return true;
  
  // Count units
  const countUnits = ["pieces"];
  if (countUnits.includes(u1) && countUnits.includes(u2)) return true;
  
  return false;
}

/**
 * Convert value from one unit to another
 * Returns null if conversion is not possible
 */
export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  
  // Same unit, no conversion needed
  if (from === to) return value;
  
  // Weight conversions
  if (from === "grams" && to === "kg") {
    return value / 1000; // grams to kg
  }
  if (from === "kg" && to === "grams") {
    return value * 1000; // kg to grams
  }
  
  // Volume conversions
  if (from === "ml" && to === "liters") {
    return value / 1000; // ml to liters
  }
  if (from === "liters" && to === "ml") {
    return value * 1000; // liters to ml
  }
  
  // Count units - no conversion (pieces = pieces)
  if (from === "pieces" && to === "pieces") {
    return value;
  }
  
  // Incompatible units
  return null;
}

/**
 * Convert forecast value to match inventory unit
 * Returns the converted value or original if conversion fails
 */
export function convertForecastToInventoryUnit(
  forecastValue: number,
  forecastUnit: string,
  inventoryUnit: string
): number {
  const converted = convertUnit(forecastValue, forecastUnit, inventoryUnit);
  
  if (converted !== null) {
    return converted;
  }
  
  // If conversion fails, check if units are compatible but just different names
  if (areUnitsCompatible(forecastUnit, inventoryUnit)) {
    // Try direct conversion with normalized units
    const normalizedConverted = convertUnit(
      forecastValue,
      normalizeUnit(forecastUnit),
      normalizeUnit(inventoryUnit)
    );
    if (normalizedConverted !== null) {
      return normalizedConverted;
    }
  }
  
  // If still can't convert, return original value (will show inconsistency)
  console.warn(
    `Cannot convert ${forecastValue} ${forecastUnit} to ${inventoryUnit}. Units may be incompatible.`
  );
  return forecastValue;
}

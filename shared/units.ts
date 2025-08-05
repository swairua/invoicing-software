// Standard Units of Measure System

export interface UnitOfMeasure {
  id: string;
  name: string;
  symbol: string;
  category: UnitCategory;
  baseUnit?: string; // For conversions
  conversionFactor?: number; // Factor to convert to base unit
  description?: string;
}

export type UnitCategory = 
  | 'length' 
  | 'area' 
  | 'volume' 
  | 'weight' 
  | 'quantity' 
  | 'time' 
  | 'temperature' 
  | 'digital'
  | 'energy'
  | 'pressure';

// Standard Units of Measure
export const standardUnits: UnitOfMeasure[] = [
  // Quantity/Count
  { id: 'piece', name: 'Piece', symbol: 'pc', category: 'quantity', description: 'Individual items' },
  { id: 'each', name: 'Each', symbol: 'ea', category: 'quantity', description: 'Individual units' },
  { id: 'pair', name: 'Pair', symbol: 'pr', category: 'quantity', description: 'Set of two items' },
  { id: 'dozen', name: 'Dozen', symbol: 'dz', category: 'quantity', baseUnit: 'piece', conversionFactor: 12 },
  { id: 'gross', name: 'Gross', symbol: 'gr', category: 'quantity', baseUnit: 'piece', conversionFactor: 144 },
  { id: 'set', name: 'Set', symbol: 'set', category: 'quantity', description: 'Collection of items' },
  { id: 'pack', name: 'Pack', symbol: 'pk', category: 'quantity', description: 'Package of items' },
  { id: 'box', name: 'Box', symbol: 'bx', category: 'quantity', description: 'Boxed items' },
  { id: 'carton', name: 'Carton', symbol: 'ctn', category: 'quantity', description: 'Carton of items' },
  { id: 'case', name: 'Case', symbol: 'cs', category: 'quantity', description: 'Case of items' },
  { id: 'pallet', name: 'Pallet', symbol: 'plt', category: 'quantity', description: 'Pallet load' },

  // Weight/Mass
  { id: 'mg', name: 'Milligram', symbol: 'mg', category: 'weight', baseUnit: 'g', conversionFactor: 0.001 },
  { id: 'g', name: 'Gram', symbol: 'g', category: 'weight', description: 'Base unit for weight' },
  { id: 'kg', name: 'Kilogram', symbol: 'kg', category: 'weight', baseUnit: 'g', conversionFactor: 1000 },
  { id: 'ton', name: 'Ton', symbol: 't', category: 'weight', baseUnit: 'kg', conversionFactor: 1000 },
  { id: 'lb', name: 'Pound', symbol: 'lb', category: 'weight', baseUnit: 'kg', conversionFactor: 0.453592 },
  { id: 'oz', name: 'Ounce', symbol: 'oz', category: 'weight', baseUnit: 'g', conversionFactor: 28.3495 },

  // Length
  { id: 'mm', name: 'Millimeter', symbol: 'mm', category: 'length', baseUnit: 'm', conversionFactor: 0.001 },
  { id: 'cm', name: 'Centimeter', symbol: 'cm', category: 'length', baseUnit: 'm', conversionFactor: 0.01 },
  { id: 'm', name: 'Meter', symbol: 'm', category: 'length', description: 'Base unit for length' },
  { id: 'km', name: 'Kilometer', symbol: 'km', category: 'length', baseUnit: 'm', conversionFactor: 1000 },
  { id: 'in', name: 'Inch', symbol: 'in', category: 'length', baseUnit: 'm', conversionFactor: 0.0254 },
  { id: 'ft', name: 'Foot', symbol: 'ft', category: 'length', baseUnit: 'm', conversionFactor: 0.3048 },
  { id: 'yd', name: 'Yard', symbol: 'yd', category: 'length', baseUnit: 'm', conversionFactor: 0.9144 },

  // Area
  { id: 'mm2', name: 'Square Millimeter', symbol: 'mm²', category: 'area', baseUnit: 'm2', conversionFactor: 0.000001 },
  { id: 'cm2', name: 'Square Centimeter', symbol: 'cm²', category: 'area', baseUnit: 'm2', conversionFactor: 0.0001 },
  { id: 'm2', name: 'Square Meter', symbol: 'm²', category: 'area', description: 'Base unit for area' },
  { id: 'km2', name: 'Square Kilometer', symbol: 'km²', category: 'area', baseUnit: 'm2', conversionFactor: 1000000 },
  { id: 'in2', name: 'Square Inch', symbol: 'in²', category: 'area', baseUnit: 'm2', conversionFactor: 0.00064516 },
  { id: 'ft2', name: 'Square Foot', symbol: 'ft²', category: 'area', baseUnit: 'm2', conversionFactor: 0.092903 },

  // Volume
  { id: 'ml', name: 'Milliliter', symbol: 'ml', category: 'volume', baseUnit: 'l', conversionFactor: 0.001 },
  { id: 'cl', name: 'Centiliter', symbol: 'cl', category: 'volume', baseUnit: 'l', conversionFactor: 0.01 },
  { id: 'dl', name: 'Deciliter', symbol: 'dl', category: 'volume', baseUnit: 'l', conversionFactor: 0.1 },
  { id: 'l', name: 'Liter', symbol: 'l', category: 'volume', description: 'Base unit for volume' },
  { id: 'litre', name: 'Litre', symbol: 'L', category: 'volume', baseUnit: 'l', conversionFactor: 1 },
  { id: 'm3', name: 'Cubic Meter', symbol: 'm³', category: 'volume', baseUnit: 'l', conversionFactor: 1000 },
  { id: 'gal', name: 'Gallon', symbol: 'gal', category: 'volume', baseUnit: 'l', conversionFactor: 3.78541 },
  { id: 'qt', name: 'Quart', symbol: 'qt', category: 'volume', baseUnit: 'l', conversionFactor: 0.946353 },
  { id: 'pt', name: 'Pint', symbol: 'pt', category: 'volume', baseUnit: 'l', conversionFactor: 0.473176 },
  { id: 'fl_oz', name: 'Fluid Ounce', symbol: 'fl oz', category: 'volume', baseUnit: 'ml', conversionFactor: 29.5735 },

  // Time
  { id: 'sec', name: 'Second', symbol: 's', category: 'time', description: 'Base unit for time' },
  { id: 'min', name: 'Minute', symbol: 'min', category: 'time', baseUnit: 'sec', conversionFactor: 60 },
  { id: 'hr', name: 'Hour', symbol: 'hr', category: 'time', baseUnit: 'sec', conversionFactor: 3600 },
  { id: 'day', name: 'Day', symbol: 'day', category: 'time', baseUnit: 'hr', conversionFactor: 24 },
  { id: 'week', name: 'Week', symbol: 'wk', category: 'time', baseUnit: 'day', conversionFactor: 7 },
  { id: 'month', name: 'Month', symbol: 'mo', category: 'time', baseUnit: 'day', conversionFactor: 30 },
  { id: 'year', name: 'Year', symbol: 'yr', category: 'time', baseUnit: 'day', conversionFactor: 365 },

  // Temperature
  { id: 'celsius', name: 'Celsius', symbol: '°C', category: 'temperature', description: 'Celsius temperature' },
  { id: 'fahrenheit', name: 'Fahrenheit', symbol: '°F', category: 'temperature', description: 'Fahrenheit temperature' },
  { id: 'kelvin', name: 'Kelvin', symbol: 'K', category: 'temperature', description: 'Kelvin temperature' },

  // Digital/Data
  { id: 'byte', name: 'Byte', symbol: 'B', category: 'digital', description: 'Base unit for digital storage' },
  { id: 'kb', name: 'Kilobyte', symbol: 'KB', category: 'digital', baseUnit: 'byte', conversionFactor: 1024 },
  { id: 'mb', name: 'Megabyte', symbol: 'MB', category: 'digital', baseUnit: 'kb', conversionFactor: 1024 },
  { id: 'gb', name: 'Gigabyte', symbol: 'GB', category: 'digital', baseUnit: 'mb', conversionFactor: 1024 },
  { id: 'tb', name: 'Terabyte', symbol: 'TB', category: 'digital', baseUnit: 'gb', conversionFactor: 1024 },

  // Energy
  { id: 'j', name: 'Joule', symbol: 'J', category: 'energy', description: 'Base unit for energy' },
  { id: 'kj', name: 'Kilojoule', symbol: 'kJ', category: 'energy', baseUnit: 'j', conversionFactor: 1000 },
  { id: 'cal', name: 'Calorie', symbol: 'cal', category: 'energy', baseUnit: 'j', conversionFactor: 4.184 },
  { id: 'kcal', name: 'Kilocalorie', symbol: 'kcal', category: 'energy', baseUnit: 'cal', conversionFactor: 1000 },
  { id: 'kwh', name: 'Kilowatt Hour', symbol: 'kWh', category: 'energy', baseUnit: 'j', conversionFactor: 3600000 },

  // Pressure
  { id: 'pa', name: 'Pascal', symbol: 'Pa', category: 'pressure', description: 'Base unit for pressure' },
  { id: 'kpa', name: 'Kilopascal', symbol: 'kPa', category: 'pressure', baseUnit: 'pa', conversionFactor: 1000 },
  { id: 'bar', name: 'Bar', symbol: 'bar', category: 'pressure', baseUnit: 'pa', conversionFactor: 100000 },
  { id: 'psi', name: 'Pounds per Square Inch', symbol: 'psi', category: 'pressure', baseUnit: 'pa', conversionFactor: 6894.76 },
  { id: 'atm', name: 'Atmosphere', symbol: 'atm', category: 'pressure', baseUnit: 'pa', conversionFactor: 101325 },
];

// Helper functions
export class UnitConverter {
  /**
   * Get units by category
   */
  static getUnitsByCategory(category: UnitCategory): UnitOfMeasure[] {
    return standardUnits.filter(unit => unit.category === category);
  }

  /**
   * Get unit by ID
   */
  static getUnitById(id: string): UnitOfMeasure | undefined {
    return standardUnits.find(unit => unit.id === id);
  }

  /**
   * Get all categories
   */
  static getAllCategories(): UnitCategory[] {
    return [...new Set(standardUnits.map(unit => unit.category))];
  }

  /**
   * Search units by name or symbol
   */
  static searchUnits(query: string): UnitOfMeasure[] {
    const lowercaseQuery = query.toLowerCase();
    return standardUnits.filter(unit => 
      unit.name.toLowerCase().includes(lowercaseQuery) ||
      unit.symbol.toLowerCase().includes(lowercaseQuery) ||
      unit.id.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Convert between units of the same category
   */
  static convertUnits(value: number, fromUnitId: string, toUnitId: string): number | null {
    const fromUnit = this.getUnitById(fromUnitId);
    const toUnit = this.getUnitById(toUnitId);
    
    if (!fromUnit || !toUnit || fromUnit.category !== toUnit.category) {
      return null;
    }

    // If same unit, return value
    if (fromUnitId === toUnitId) {
      return value;
    }

    // Find base unit for the category
    const baseUnit = standardUnits.find(u => 
      u.category === fromUnit.category && !u.baseUnit
    );
    
    if (!baseUnit) return null;

    // Convert from source unit to base unit
    let baseValue = value;
    if (fromUnit.baseUnit && fromUnit.conversionFactor) {
      baseValue = value * fromUnit.conversionFactor;
    }

    // Convert from base unit to target unit
    let result = baseValue;
    if (toUnit.baseUnit && toUnit.conversionFactor) {
      result = baseValue / toUnit.conversionFactor;
    }

    return result;
  }

  /**
   * Format unit display
   */
  static formatUnit(unit: UnitOfMeasure, showSymbol: boolean = true): string {
    return showSymbol ? `${unit.name} (${unit.symbol})` : unit.name;
  }

  /**
   * Get most common units for each category
   */
  static getCommonUnits(): Record<UnitCategory, UnitOfMeasure[]> {
    return {
      quantity: this.getUnitsByCategory('quantity').slice(0, 6),
      weight: [
        this.getUnitById('g')!,
        this.getUnitById('kg')!,
        this.getUnitById('ton')!,
        this.getUnitById('lb')!,
        this.getUnitById('oz')!,
      ],
      length: [
        this.getUnitById('mm')!,
        this.getUnitById('cm')!,
        this.getUnitById('m')!,
        this.getUnitById('km')!,
        this.getUnitById('in')!,
        this.getUnitById('ft')!,
      ],
      area: [
        this.getUnitById('cm2')!,
        this.getUnitById('m2')!,
        this.getUnitById('km2')!,
        this.getUnitById('ft2')!,
      ],
      volume: [
        this.getUnitById('ml')!,
        this.getUnitById('l')!,
        this.getUnitById('m3')!,
        this.getUnitById('gal')!,
        this.getUnitById('fl_oz')!,
      ],
      time: [
        this.getUnitById('sec')!,
        this.getUnitById('min')!,
        this.getUnitById('hr')!,
        this.getUnitById('day')!,
        this.getUnitById('week')!,
        this.getUnitById('month')!,
      ],
      temperature: this.getUnitsByCategory('temperature'),
      digital: this.getUnitsByCategory('digital').slice(0, 5),
      energy: this.getUnitsByCategory('energy').slice(0, 4),
      pressure: this.getUnitsByCategory('pressure').slice(0, 4),
    };
  }
}

export default UnitConverter;

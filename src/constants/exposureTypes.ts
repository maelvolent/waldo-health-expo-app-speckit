/**
 * Exposure Types and PPE Constants
 * Defines all 12 exposure types and 8 PPE categories for the app
 *
 * Based on NZ construction industry standards and ACC requirements
 */

export interface ExposureTypeDefinition {
  id: string;
  label: string;
  category: 'respiratory' | 'skin' | 'noise' | 'environmental';
  description: string;
  commonPPE: string[];
  iconName: string; // Maps to assets/exposure-icons/
  educationalTags: string[];
}

export const EXPOSURE_TYPES: Record<string, ExposureTypeDefinition> = {
  SILICA_DUST: {
    id: 'silica_dust',
    label: 'Silica Dust',
    category: 'respiratory',
    description: 'Crystalline silica dust from cutting, grinding, or drilling concrete/stone',
    commonPPE: ['P2_RESPIRATOR', 'SAFETY_GLASSES', 'GLOVES'],
    iconName: 'silica-dust',
    educationalTags: ['silica', 'respiratory', 'dust'],
  },
  ASBESTOS_A: {
    id: 'asbestos_a',
    label: 'Asbestos Type A',
    category: 'respiratory',
    description: 'Type A asbestos work (non-friable asbestos in good condition)',
    commonPPE: ['P2_RESPIRATOR', 'DISPOSABLE_COVERALLS', 'GLOVES', 'SAFETY_GLASSES'],
    iconName: 'asbestos-a',
    educationalTags: ['asbestos', 'respiratory', 'carcinogen'],
  },
  ASBESTOS_B: {
    id: 'asbestos_b',
    label: 'Asbestos Type B',
    category: 'respiratory',
    description: 'Type B asbestos work (friable asbestos or large quantities)',
    commonPPE: ['POWERED_RESPIRATOR', 'DISPOSABLE_COVERALLS', 'GLOVES', 'SAFETY_GLASSES'],
    iconName: 'asbestos-b',
    educationalTags: ['asbestos', 'respiratory', 'carcinogen', 'licensed'],
  },
  HAZARDOUS_CHEMICALS: {
    id: 'hazardous_chemicals',
    label: 'Hazardous Chemicals',
    category: 'skin',
    description: 'Exposure to hazardous substances (acids, solvents, adhesives, etc.)',
    commonPPE: ['GLOVES', 'SAFETY_GLASSES', 'RESPIRATOR', 'PROTECTIVE_CLOTHING'],
    iconName: 'chemicals',
    educationalTags: ['chemicals', 'skin', 'respiratory'],
  },
  NOISE: {
    id: 'noise',
    label: 'Excessive Noise',
    category: 'noise',
    description: 'Noise levels above 85 dB(A) over 8 hours',
    commonPPE: ['HEARING_PROTECTION'],
    iconName: 'noise',
    educationalTags: ['noise', 'hearing', 'ppe'],
  },
  METH_CONTAMINATION: {
    id: 'meth_contamination',
    label: 'Meth Contamination',
    category: 'respiratory',
    description: 'Methamphetamine contaminated environments',
    commonPPE: ['P2_RESPIRATOR', 'DISPOSABLE_COVERALLS', 'GLOVES', 'SAFETY_GLASSES'],
    iconName: 'meth',
    educationalTags: ['meth', 'respiratory', 'contamination'],
  },
  MOULD: {
    id: 'mould',
    label: 'Mould Exposure',
    category: 'respiratory',
    description: 'Mould growth in buildings or damp environments',
    commonPPE: ['P2_RESPIRATOR', 'GLOVES', 'SAFETY_GLASSES'],
    iconName: 'mould',
    educationalTags: ['mould', 'respiratory', 'biological'],
  },
  CONTAMINATED_SOILS: {
    id: 'contaminated_soils',
    label: 'Contaminated Soils',
    category: 'environmental',
    description: 'Soils contaminated with heavy metals, petroleum, or other hazards',
    commonPPE: ['GLOVES', 'SAFETY_BOOTS', 'PROTECTIVE_CLOTHING', 'RESPIRATOR'],
    iconName: 'contaminated-soil',
    educationalTags: ['soil', 'environmental', 'contamination'],
  },
  HEAT_STRESS: {
    id: 'heat_stress',
    label: 'Heat Stress',
    category: 'environmental',
    description: 'Working in hot environments or with heat-generating equipment',
    commonPPE: [],
    iconName: 'heat-stress',
    educationalTags: ['heat', 'environmental', 'health'],
  },
  WELDING_FUMES: {
    id: 'welding_fumes',
    label: 'Welding Fumes',
    category: 'respiratory',
    description: 'Metal fumes and gases from welding processes',
    commonPPE: ['WELDING_RESPIRATOR', 'WELDING_HELMET', 'GLOVES', 'PROTECTIVE_CLOTHING'],
    iconName: 'welding-fumes',
    educationalTags: ['welding', 'respiratory', 'fumes'],
  },
  BIOLOGICAL_HAZARDS: {
    id: 'biological_hazards',
    label: 'Biological Hazards',
    category: 'environmental',
    description: 'Bacteria, viruses, or other biological agents',
    commonPPE: ['GLOVES', 'RESPIRATOR', 'PROTECTIVE_CLOTHING', 'SAFETY_GLASSES'],
    iconName: 'biological',
    educationalTags: ['biological', 'health', 'contamination'],
  },
  RADIATION: {
    id: 'radiation',
    label: 'Radiation Exposure',
    category: 'environmental',
    description: 'Ionizing or non-ionizing radiation sources',
    commonPPE: ['PROTECTIVE_CLOTHING'],
    iconName: 'radiation',
    educationalTags: ['radiation', 'environmental', 'safety'],
  },
};

export interface PPEDefinition {
  id: string;
  label: string;
  category: 'respiratory' | 'eye' | 'hand' | 'body' | 'hearing' | 'foot';
  description: string;
}

export const PPE_TYPES: Record<string, PPEDefinition> = {
  P2_RESPIRATOR: {
    id: 'p2_respirator',
    label: 'P2 Respirator',
    category: 'respiratory',
    description: 'Filters at least 94% of airborne particles',
  },
  POWERED_RESPIRATOR: {
    id: 'powered_respirator',
    label: 'Powered Air Respirator',
    category: 'respiratory',
    description: 'Battery-powered air purifying respirator',
  },
  WELDING_RESPIRATOR: {
    id: 'welding_respirator',
    label: 'Welding Respirator',
    category: 'respiratory',
    description: 'Respirator designed for welding fumes',
  },
  RESPIRATOR: {
    id: 'respirator',
    label: 'Respirator (General)',
    category: 'respiratory',
    description: 'General purpose respirator',
  },
  SAFETY_GLASSES: {
    id: 'safety_glasses',
    label: 'Safety Glasses',
    category: 'eye',
    description: 'Impact-resistant eye protection',
  },
  WELDING_HELMET: {
    id: 'welding_helmet',
    label: 'Welding Helmet',
    category: 'eye',
    description: 'Auto-darkening welding helmet',
  },
  GLOVES: {
    id: 'gloves',
    label: 'Gloves',
    category: 'hand',
    description: 'Protective gloves (type depends on hazard)',
  },
  DISPOSABLE_COVERALLS: {
    id: 'disposable_coveralls',
    label: 'Disposable Coveralls',
    category: 'body',
    description: 'Single-use protective coveralls',
  },
  PROTECTIVE_CLOTHING: {
    id: 'protective_clothing',
    label: 'Protective Clothing',
    category: 'body',
    description: 'General protective clothing',
  },
  HEARING_PROTECTION: {
    id: 'hearing_protection',
    label: 'Hearing Protection',
    category: 'hearing',
    description: 'Earplugs or earmuffs',
  },
  SAFETY_BOOTS: {
    id: 'safety_boots',
    label: 'Safety Boots',
    category: 'foot',
    description: 'Steel-toe safety boots',
  },
};

// Helper functions
export const getExposureTypeById = (id: string): ExposureTypeDefinition | undefined => {
  return Object.values(EXPOSURE_TYPES).find(type => type.id === id);
};

export const getPPEById = (id: string): PPEDefinition | undefined => {
  return Object.values(PPE_TYPES).find(ppe => ppe.id === id);
};

export const getExposureTypesByCategory = (
  category: 'respiratory' | 'skin' | 'noise' | 'environmental'
): ExposureTypeDefinition[] => {
  return Object.values(EXPOSURE_TYPES).filter(type => type.category === category);
};

export const SEVERITY_LEVELS = ['low', 'medium', 'high'] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

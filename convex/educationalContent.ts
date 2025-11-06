/**
 * T085-T087: Educational Content Convex Functions
 * Queries and mutations for educational content about workplace hazards
 */

import { v } from 'convex/values';
import { query, mutation } from './_generated/server';

/**
 * T085: List educational content with filtering
 * Returns published educational articles with optional filtering by exposure type and tags
 */
export const list = query({
  args: {
    exposureType: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { exposureType, tags, limit = 50 } = args;

    // Start with base query for published content
    let results = await ctx.db
      .query('educationalContent')
      .withIndex('by_isPublished', q => q.eq('isPublished', true))
      .collect();

    // Filter by exposure type if provided
    if (exposureType) {
      results = results.filter(
        item => item.exposureType === exposureType || item.exposureType === 'general'
      );
    }

    // Filter by tags if provided (match any tag)
    if (tags && tags.length > 0) {
      results = results.filter(item => item.tags.some(tag => tags.includes(tag)));
    }

    // Sort by view count (most popular first)
    results.sort((a, b) => b.viewCount - a.viewCount);

    // Apply limit
    return results.slice(0, limit);
  },
});

/**
 * T086: Get single educational content item by ID
 * Returns full content for a single article
 */
export const get = query({
  args: {
    id: v.id('educationalContent'),
  },
  handler: async (ctx, args) => {
    const content = await ctx.db.get(args.id);

    if (!content) {
      throw new Error('Educational content not found');
    }

    // Only return if published
    if (!content.isPublished) {
      throw new Error('Content not available');
    }

    return content;
  },
});

/**
 * T087: Increment view count for an article
 * Called when user views educational content
 */
export const incrementViewCount = mutation({
  args: {
    id: v.id('educationalContent'),
  },
  handler: async (ctx, args) => {
    const content = await ctx.db.get(args.id);

    if (!content) {
      throw new Error('Educational content not found');
    }

    // Increment view count
    await ctx.db.patch(args.id, {
      viewCount: content.viewCount + 1,
    });

    return { success: true, newViewCount: content.viewCount + 1 };
  },
});

/**
 * Admin function: Create educational content
 * (Not exposed to regular users)
 */
export const create = mutation({
  args: {
    title: v.string(),
    exposureType: v.string(),
    content: v.string(),
    thumbnailUrl: v.optional(v.union(v.string(), v.null())),
    mediaUrls: v.optional(v.array(v.string())),
    source: v.string(),
    sourceUrl: v.optional(v.union(v.string(), v.null())),
    tags: v.array(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // TODO: Add admin role check when auth is expanded
    // For now, this is admin-only function

    const now = Date.now();

    const id = await ctx.db.insert('educationalContent', {
      title: args.title,
      exposureType: args.exposureType,
      content: args.content,
      thumbnailUrl: args.thumbnailUrl ?? null,
      mediaUrls: args.mediaUrls ?? [],
      source: args.source,
      sourceUrl: args.sourceUrl ?? null,
      tags: args.tags,
      viewCount: 0,
      isPublished: args.isPublished ?? false,
      publishedAt: args.isPublished ? now : null,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Admin function: Update educational content
 */
export const update = mutation({
  args: {
    id: v.id('educationalContent'),
    title: v.optional(v.string()),
    exposureType: v.optional(v.string()),
    content: v.optional(v.string()),
    thumbnailUrl: v.optional(v.union(v.string(), v.null())),
    mediaUrls: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    sourceUrl: v.optional(v.union(v.string(), v.null())),
    tags: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // TODO: Add admin role check

    const { id, ...updates } = args;
    const content = await ctx.db.get(id);

    if (!content) {
      throw new Error('Educational content not found');
    }

    const now = Date.now();
    const updateData: any = {
      ...updates,
      updatedAt: now,
    };

    // Set publishedAt when first published
    if (updates.isPublished && !content.isPublished) {
      updateData.publishedAt = now;
    }

    await ctx.db.patch(id, updateData);

    return { success: true };
  },
});

/**
 * T088: Seed initial educational content
 * Populates 12 educational articles (one per exposure type)
 * Based on WorkSafe NZ guidelines and health & safety regulations
 */
export const seedEducationalContent = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if content already exists
    const existing = await ctx.db
      .query('educationalContent')
      .collect();

    if (existing.length > 0) {
      return {
        success: false,
        message: 'Educational content already exists',
        count: existing.length
      };
    }

    const now = Date.now();

    // Define 12 educational articles covering all exposure types
    const articles = [
      {
        title: 'Silica Dust Exposure: Understanding the Risks',
        exposureType: 'silica_dust',
        content: `Respirable crystalline silica (RCS) is a serious workplace hazard in construction and manufacturing. When materials containing silica are cut, ground, or drilled, tiny dust particles are released that can be breathed deep into the lungs.

**Health Risks:**
- Silicosis (irreversible lung disease)
- Lung cancer
- Chronic obstructive pulmonary disease (COPD)
- Kidney disease

**Control Measures:**
- Use water suppression or dust extraction at source
- Ensure adequate ventilation
- Use respiratory protective equipment (RPE) - minimum P2 respirator
- Regular health monitoring for exposed workers
- Keep work areas clean with HEPA vacuum cleaners

**Legal Requirements:**
Under the Health and Safety at Work (Hazardous Substances) Regulations 2017, employers must manage RCS exposure using the hierarchy of controls. The workplace exposure standard (WES) for RCS is 0.05 mg/m³ (8-hour TWA).

**PPE Requirements:**
- P2 or P3 respirator (depending on exposure level)
- Safety glasses or goggles
- Protective clothing that prevents dust accumulation
- Regular fit testing for respirators`,
        source: 'WorkSafe New Zealand',
        sourceUrl: 'https://www.worksafe.govt.nz/topic-and-industry/dust/respirable-crystalline-silica/',
        tags: ['dust', 'respiratory', 'construction', 'ppe'],
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
        viewCount: 0,
        thumbnailUrl: null,
        mediaUrls: [],
      },
      {
        title: 'Asbestos Class A: Friable Asbestos Safety',
        exposureType: 'asbestos_class_a',
        content: `Friable asbestos (Class A) is asbestos material that can be crumbled, pulverized, or reduced to powder by hand pressure. This is the most dangerous type of asbestos due to the ease with which fibers become airborne.

**Health Risks:**
- Asbestosis (scarring of lung tissue)
- Mesothelioma (cancer of the lining of the lungs)
- Lung cancer
- Other cancers (larynx, ovary)

**When Found:**
- Sprayed insulation or fireproofing
- Pipe and boiler insulation
- Asbestos cement in poor condition
- Damaged asbestos products

**Control Measures:**
- Class A asbestos work requires a Class A asbestos removal license
- Only licensed removalists can handle friable asbestos
- Full enclosure and negative pressure systems required
- Air monitoring during and after removal
- Decontamination procedures mandatory

**If You Encounter Friable Asbestos:**
1. STOP work immediately
2. Do not disturb the material
3. Isolate the area
4. Contact a licensed Class A asbestos assessor
5. Engage licensed Class A removal contractor

**Legal Requirements:**
Health and Safety at Work (Asbestos) Regulations 2016 strictly regulate Class A asbestos work. Penalties for non-compliance are severe.`,
        source: 'WorkSafe New Zealand',
        sourceUrl: 'https://www.worksafe.govt.nz/topic-and-industry/asbestos/',
        tags: ['asbestos', 'respiratory', 'licensed-work', 'high-risk'],
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
        viewCount: 0,
        thumbnailUrl: null,
        mediaUrls: [],
      },
      {
        title: 'Asbestos Class B: Non-Friable Asbestos Awareness',
        exposureType: 'asbestos_class_b',
        content: `Non-friable asbestos (Class B) is asbestos-containing material (ACM) that is bound in cement, resin, or other binding material. While less immediately dangerous than friable asbestos, it still poses serious health risks.

**Common Products:**
- Asbestos cement sheets (fibrolite)
- Vinyl floor tiles
- Roof shingles
- Textured coatings
- Gaskets and seals

**Health Risks:**
The same health risks as friable asbestos exist, but exposure typically occurs when:
- Cutting, drilling, or sanding ACM
- Breaking or demolishing ACM
- Weathering and deterioration of ACM

**Control Measures:**
- Class B license required for removal of >10m² of non-friable asbestos
- Use wet methods to prevent dust generation
- Minimize breaking or cutting of material
- Proper disposal at approved facilities
- Air monitoring may be required

**Safe Work Practices:**
- Pre-work asbestos assessment and identification
- Wet down materials before and during work
- Use hand tools rather than power tools where possible
- Ensure proper RPE (P2 respirator minimum)
- Proper decontamination and waste disposal

**When to Engage Licensed Removalist:**
- Removal of >10m² of non-friable ACM
- Any work on deteriorated non-friable ACM
- Work in occupied buildings
- Any uncertainty about material condition`,
        source: 'WorkSafe New Zealand',
        sourceUrl: 'https://www.worksafe.govt.nz/topic-and-industry/asbestos/asbestos-removal/',
        tags: ['asbestos', 'respiratory', 'ppe', 'construction'],
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
        viewCount: 0,
        thumbnailUrl: null,
        mediaUrls: [],
      },
      {
        title: 'Welding Fume Hazards and Controls',
        exposureType: 'welding_fumes',
        content: `Welding fumes contain a complex mixture of metallic oxides, silicates, and fluorides. The composition varies depending on the welding process and materials being welded.

**Health Risks:**
- Metal fume fever (flu-like symptoms)
- Lung damage and reduced lung function
- Various types of cancer
- Neurological effects (especially from manganese)
- Occupational asthma

**High-Risk Welding:**
- Stainless steel (chromium and nickel exposure)
- Galvanized metal (zinc oxide fumes)
- Painted or coated metals
- In confined spaces

**Control Measures (Hierarchy):**
1. Elimination: Use alternative joining methods where possible
2. Substitution: Use less hazardous welding processes or materials
3. Engineering: Local exhaust ventilation, general ventilation
4. Administrative: Limit exposure time, training
5. PPE: Respiratory protection, protective clothing

**Ventilation Requirements:**
- Local exhaust ventilation (LEV) at welding point
- Minimum air flow velocity of 0.5 m/s at welding arc
- Regular testing and maintenance of extraction systems
- Natural ventilation alone is rarely adequate

**PPE Requirements:**
- Powered air-purifying respirator (PAPR) for high-exposure tasks
- Half-face respirator with P2 or P3 filters for routine welding
- Welding helmet with proper filter shade
- Fire-resistant clothing
- Welding gloves and safety boots`,
        source: 'WorkSafe New Zealand',
        sourceUrl: 'https://www.worksafe.govt.nz/topic-and-industry/welding/',
        tags: ['welding', 'respiratory', 'ppe', 'ventilation'],
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
        viewCount: 0,
        thumbnailUrl: null,
        mediaUrls: [],
      },
      {
        title: 'Hazardous Chemicals: Safe Handling Guide',
        exposureType: 'hazardous_chemicals',
        content: `Hazardous chemicals are substances that can cause harm to people or the environment. Understanding proper handling and control measures is essential for workplace safety.

**Types of Hazardous Chemicals:**
- Corrosive (acids, alkalis)
- Toxic (pesticides, solvents)
- Flammable (petrol, solvents)
- Oxidizing (bleach, peroxides)
- Carcinogenic (benzene, formaldehyde)

**Health Effects:**
- Acute: Burns, poisoning, respiratory distress
- Chronic: Cancer, organ damage, reproductive harm
- Routes: Inhalation, skin contact, ingestion

**Control Measures:**
- Risk assessment and hazard identification
- Safety Data Sheets (SDS) must be readily available
- Proper storage and segregation
- Engineering controls (ventilation, enclosed systems)
- Administrative controls (training, procedures)
- PPE as last line of defense

**Legal Requirements:**
Under HSWA (Hazardous Substances) Regulations 2017:
- Maintain hazardous substance register
- Provide SDS for all hazardous substances
- Use approved containers and labeling
- Implement controls based on risk assessment
- Emergency response procedures required

**PPE Selection:**
Based on SDS recommendations:
- Chemical-resistant gloves (specific to chemical)
- Safety glasses or face shield
- Respiratory protection (if required by SDS)
- Chemical-resistant apron or coveralls
- Safety boots (chemical resistant if needed)

**Emergency Procedures:**
- Eye wash stations within 10 seconds travel time
- Safety showers for corrosive chemicals
- Spill kits readily accessible
- First aid training for chemical exposures`,
        source: 'WorkSafe New Zealand',
        sourceUrl: 'https://www.worksafe.govt.nz/topic-and-industry/hazardous-substances/',
        tags: ['chemicals', 'ppe', 'emergency', 'legal'],
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
        viewCount: 0,
        thumbnailUrl: null,
        mediaUrls: [],
      },
      {
        title: 'Noise Exposure: Protecting Your Hearing',
        exposureType: 'noise',
        content: `Noise-induced hearing loss (NIHL) is one of New Zealand's most common occupational diseases. It is permanent and preventable with proper controls.

**Health Effects:**
- Noise-induced hearing loss (irreversible)
- Tinnitus (ringing in ears)
- Reduced ability to hear warning signals
- Stress and fatigue
- Communication difficulties

**Exposure Standards:**
- Workplace Exposure Standard: 85 dB(A) LAeq,8h
- Peak sound pressure level: 140 dB(C)
- At 85 dB(A), hearing protection must be available
- At 90 dB(A), hearing protection must be worn

**Common Noise Sources:**
- Power tools (90-110 dB)
- Heavy machinery (85-100 dB)
- Impact tools (100-120 dB)
- Construction equipment (80-95 dB)

**Control Hierarchy:**
1. Eliminate: Redesign process to remove noise source
2. Substitute: Use quieter equipment or methods
3. Engineering: Enclosures, barriers, vibration dampening
4. Administrative: Limit exposure time, rotate workers
5. PPE: Hearing protection (earplugs, earmuffs)

**Hearing Protection:**
- Earplugs: 15-30 dB reduction (must be fitted correctly)
- Earmuffs: 20-35 dB reduction
- Dual protection: Use both for very high noise levels
- Proper fit and maintenance essential
- Regular audiometric testing for exposed workers

**Warning Signs:**
- Need to shout to be heard at arm's length
- Ringing in ears after work
- Temporary hearing loss after noise exposure
- Noise meter reading >85 dB(A)`,
        source: 'WorkSafe New Zealand',
        sourceUrl: 'https://www.worksafe.govt.nz/topic-and-industry/noise/',
        tags: ['noise', 'ppe', 'hearing', 'monitoring'],
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
        viewCount: 0,
        thumbnailUrl: null,
        mediaUrls: [],
      },
      {
        title: 'Vibration Exposure: Hand-Arm Vibration Syndrome',
        exposureType: 'vibration',
        content: `Hand-Arm Vibration Syndrome (HAVS) is a permanent and disabling condition caused by regular use of vibrating tools. Once you have HAVS, it doesn't go away.

**Health Effects:**
- Vibration white finger (Raynaud's phenomenon)
- Numbness and tingling in hands
- Loss of grip strength and dexterity
- Pain in hands and arms
- Sensitivity to cold

**High-Risk Tools:**
- Pneumatic drills and breakers
- Chainsaws
- Grinders and sanders
- Impact wrenches
- Hammer drills
- Concrete vibrators

**Exposure Standards:**
- 8-hour exposure action value (EAV): 2.5 m/s²
- 8-hour exposure limit value (ELV): 5.0 m/s²
- Daily exposure must not exceed ELV

**Control Measures:**
1. Equipment selection: Use low-vibration tools
2. Maintenance: Keep tools well-maintained and sharp
3. Work planning: Limit continuous exposure periods
4. Job rotation: Share vibration-intensive tasks
5. PPE: Anti-vibration gloves (limited effectiveness)

**Best Practices:**
- Limit exposure to 4-hour periods maximum
- Take regular breaks (10 mins per hour)
- Use proper grip technique (loose, not tight)
- Keep hands warm and dry
- Avoid smoking (reduces blood circulation)
- Report symptoms early

**Tool Maintenance:**
- Keep cutting tools sharp
- Replace worn or damaged parts
- Balance rotating tools properly
- Check anti-vibration mounts regularly
- Service according to manufacturer schedule

**Health Monitoring:**
Workers regularly exposed to vibration should have:
- Pre-employment health questionnaire
- Annual health surveillance
- Immediate assessment if symptoms develop`,
        source: 'WorkSafe New Zealand',
        sourceUrl: 'https://www.worksafe.govt.nz/topic-and-industry/vibration/',
        tags: ['vibration', 'tools', 'health-monitoring', 'ppe'],
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
        viewCount: 0,
        thumbnailUrl: null,
        mediaUrls: [],
      },
      {
        title: 'Heat Stress Management in Construction',
        exposureType: 'heat_stress',
        content: `Heat stress occurs when the body cannot cool itself enough to maintain a healthy temperature. Construction workers are particularly vulnerable during New Zealand's hot summer months.

**Health Effects:**
- Heat rash and cramps
- Heat exhaustion (weakness, nausea, headache)
- Heat stroke (life-threatening emergency)
- Reduced concentration and increased accident risk

**Risk Factors:**
- High temperature and humidity
- Direct sun exposure
- Heavy physical work
- Protective clothing that traps heat
- Lack of acclimatization
- Dehydration

**Prevention Measures:**
- Provide cool drinking water (1 cup every 15-20 mins)
- Schedule heavy work during cooler parts of day
- Provide shaded rest areas
- Allow acclimatization period (5-7 days)
- Implement buddy system to monitor co-workers
- Train workers to recognize heat stress symptoms

**Warning Signs:**
- Excessive sweating or no sweating
- Dizziness, confusion, or irritability
- Rapid heartbeat
- Nausea or vomiting
- Headache
- Skin that is hot, red, or clammy

**Emergency Response:**
For heat stroke (medical emergency):
1. Call 111 immediately
2. Move person to cool, shaded area
3. Remove excess clothing
4. Cool with wet cloths, fanning, ice packs
5. Do NOT give fluids if unconscious

**Work Modifications:**
- Increase frequency of rest breaks
- Rotate workers on demanding tasks
- Reduce work pace during extreme heat
- Use mechanical aids to reduce physical effort
- Provide cooling vests or wet towels`,
        source: 'WorkSafe New Zealand',
        sourceUrl: 'https://www.worksafe.govt.nz/topic-and-industry/weather/working-in-the-heat/',
        tags: ['heat', 'weather', 'emergency', 'hydration'],
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
        viewCount: 0,
        thumbnailUrl: null,
        mediaUrls: [],
      },
      {
        title: 'Cold Exposure and Hypothermia Prevention',
        exposureType: 'cold_exposure',
        content: `Working in cold conditions poses serious health risks, particularly in outdoor construction, forestry, and alpine work. Understanding cold stress and prevention is vital.

**Health Effects:**
- Hypothermia (body temperature drops below 35°C)
- Frostbite (freezing of skin and tissues)
- Reduced dexterity and coordination
- Impaired judgment and decision-making
- Increased risk of accidents

**Risk Factors:**
- Low temperature and wind chill
- Wet conditions
- Inadequate clothing
- Prolonged exposure
- Fatigue and dehydration
- Individual susceptibility

**Prevention Measures:**
- Provide appropriate cold-weather clothing
- Allow warm-up breaks in heated areas
- Provide hot drinks and warm food
- Schedule work during warmer parts of day
- Implement buddy system
- Monitor weather conditions

**Clothing Requirements:**
- Layer system: base, insulation, outer shell
- Windproof and waterproof outer layer
- Insulated gloves (allow dexterity for tasks)
- Warm headwear (significant heat loss from head)
- Insulated, waterproof boots
- High-visibility clothing for outdoor work

**Warning Signs:**
- Shivering (early sign)
- Numbness or tingling in extremities
- Confusion or slurred speech
- Drowsiness or exhaustion
- Blue or pale skin
- Loss of coordination

**Emergency Response:**
For hypothermia:
1. Call 111 for severe cases
2. Move person to warm, dry location
3. Remove wet clothing
4. Warm gradually with blankets, warm drinks
5. Do NOT use direct heat (heating pad, hot bath)

**Work Planning:**
- Schedule rest breaks in warm areas (10-15 mins per hour)
- Reduce work pace in extreme cold
- Avoid alcohol (increases heat loss)
- Stay hydrated and well-fed
- Plan for emergency shelter`,
        source: 'WorkSafe New Zealand',
        sourceUrl: 'https://www.worksafe.govt.nz/topic-and-industry/weather/working-in-the-cold/',
        tags: ['cold', 'weather', 'emergency', 'clothing'],
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
        viewCount: 0,
        thumbnailUrl: null,
        mediaUrls: [],
      },
      {
        title: 'Contaminated Soil: Identifying and Managing Risks',
        exposureType: 'contaminated_soils',
        content: `Contaminated land can contain hazardous substances from previous industrial use, waste disposal, or agricultural activities. Proper assessment and management is legally required.

**Common Contaminants:**
- Heavy metals (lead, arsenic, cadmium)
- Petroleum hydrocarbons
- Asbestos in fill material
- Pesticides and herbicides
- Industrial chemicals

**Health Risks:**
- Acute poisoning from high-level exposure
- Chronic health effects (cancer, organ damage)
- Skin absorption of contaminants
- Inhalation of contaminated dust
- Ingestion via hand-to-mouth contact

**When to Suspect Contamination:**
- Previous industrial use of site
- Former petrol stations or workshops
- Waste disposal sites
- Unusual soil color or odor
- Absence of vegetation
- Visible contamination or staining

**Legal Requirements:**
- Site investigation before disturbing soil
- Resource consent may be required
- NES for Assessing and Managing Contaminants in Soil
- Contaminated sites register check
- Unexpected discovery protocol

**Control Measures:**
- Preliminary site investigation (PSI)
- Detailed site investigation (DSI) if contamination suspected
- Dust suppression (water sprays, wetting)
- Containment of contaminated material
- Proper PPE for workers
- Hygiene facilities (wash stations)

**PPE Requirements:**
- Chemical-resistant gloves
- Coveralls or protective clothing
- P2 or P3 respirator (if dust present)
- Safety glasses
- Safety boots
- Regular decontamination

**Safe Work Practices:**
- No eating, drinking, or smoking in work area
- Wash hands and face before breaks
- Shower and change clothes after work
- Separate clean and dirty areas
- Proper disposal of contaminated materials
- Health monitoring for exposed workers`,
        source: 'WorkSafe New Zealand & Ministry for the Environment',
        sourceUrl: 'https://www.worksafe.govt.nz/topic-and-industry/contaminated-land/',
        tags: ['soil', 'contamination', 'ppe', 'assessment'],
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
        viewCount: 0,
        thumbnailUrl: null,
        mediaUrls: [],
      },
      {
        title: 'Lead Exposure: Old Paint and Construction',
        exposureType: 'lead',
        content: `Lead is a toxic heavy metal commonly found in paint used before 1980. Work involving old buildings can expose workers to dangerous lead levels.

**Health Effects:**
- Neurological damage (especially in children)
- Kidney damage
- Reproductive harm
- High blood pressure and heart disease
- Anemia and fatigue

**Where Lead is Found:**
- Paint in buildings built before 1980
- Old plumbing and solder
- Contaminated soil around painted buildings
- Imported goods and ceramics
- Some batteries and electronics

**High-Risk Activities:**
- Sanding or grinding old paint
- Demolition of old buildings
- Hot work (burning or welding painted surfaces)
- Dry scraping of painted surfaces
- Disturbing lead-contaminated soil

**Control Measures:**
1. Test before work: XRF testing or lab analysis
2. Wet methods: Keep surfaces wet during removal
3. Containment: Seal work area, use negative pressure
4. Ventilation: Local exhaust ventilation systems
5. Waste disposal: Licensed disposal of lead waste
6. Hygiene: Decontamination facilities mandatory

**PPE Requirements:**
- P3 respirator or powered air-purifying respirator (PAPR)
- Disposable coveralls with hood
- Gloves (nitrile or PVC)
- Safety glasses
- Dedicated work boots (left on site)

**Blood Lead Monitoring:**
Required for workers with significant exposure:
- Baseline test before starting work
- Regular testing (frequency based on exposure level)
- Action level: 0.24 μmol/L
- Removal from exposure if exceeds action level

**Safe Work Practices:**
- Never dry sand or grind lead paint
- Use wet methods or chemical strippers
- Provide separate eating and work areas
- Shower and change clothes after work
- Wash work clothes separately
- Do not take work clothes home`,
        source: 'WorkSafe New Zealand',
        sourceUrl: 'https://www.worksafe.govt.nz/topic-and-industry/lead/',
        tags: ['lead', 'paint', 'respiratory', 'health-monitoring'],
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
        viewCount: 0,
        thumbnailUrl: null,
        mediaUrls: [],
      },
      {
        title: 'Confined Space Entry: Essential Safety Guide',
        exposureType: 'confined_space',
        content: `A confined space is any fully or partially enclosed space that is not intended for continuous human occupancy and has restricted entry or exit. These spaces present unique and serious hazards.

**What is a Confined Space:**
- Storage tanks and silos
- Manholes and pits
- Tunnels and shafts
- Large pipes and ducts
- Ship holds and ballast tanks
- Excavations deeper than 1.5m

**Hazardous Atmospheres:**
- Oxygen deficiency (<19.5%) or enrichment (>23%)
- Toxic gases (H₂S, CO, CO₂)
- Flammable atmospheres
- Engulfment hazards (grain, water, materials)

**Health Risks:**
- Asphyxiation (lack of oxygen)
- Poisoning from toxic gases
- Fire or explosion
- Drowning or engulfment
- Temperature extremes

**Legal Requirements:**
Before entry, must have:
- Written safe work plan
- Atmospheric testing
- Permit to enter system
- Trained and competent workers
- Emergency rescue plan
- Continuous monitoring

**Atmospheric Testing:**
Test for (in this order):
1. Oxygen level (19.5% - 23%)
2. Flammable gases (<10% LEL)
3. Toxic gases (below exposure limits)
4. Test continuously during occupancy

**Control Measures:**
- Isolation: Lock out all energy sources
- Ventilation: Purge and ventilate space
- Testing: Continuous atmospheric monitoring
- Access control: Permit system
- Standby person: Maintain communication
- Rescue equipment: Ready and accessible

**PPE and Equipment:**
- Full body harness with retrieval line
- Respiratory protection (if required by testing)
- Gas monitor (calibrated and bump tested)
- Communication equipment
- Emergency breathing apparatus (escape set)
- Lighting (intrinsically safe if flammable atmosphere)

**Emergency Procedures:**
- Never enter for rescue without proper equipment
- Standby person must not enter
- Call emergency services (111)
- Only trained rescue team to enter
- Have retrieval system ready`,
        source: 'WorkSafe New Zealand',
        sourceUrl: 'https://www.worksafe.govt.nz/topic-and-industry/confined-spaces/',
        tags: ['confined-space', 'atmospheric', 'emergency', 'permit'],
        isPublished: true,
        publishedAt: now,
        updatedAt: now,
        viewCount: 0,
        thumbnailUrl: null,
        mediaUrls: [],
      },
    ];

    // Insert all articles
    const insertedIds = [];
    for (const article of articles) {
      const id = await ctx.db.insert('educationalContent', article);
      insertedIds.push(id);
    }

    return {
      success: true,
      message: 'Successfully seeded educational content',
      count: insertedIds.length,
      ids: insertedIds
    };
  },
});

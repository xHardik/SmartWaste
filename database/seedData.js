/**
 * Seed data for Smart Waste Management Prototype
 * Designed for realistic academic and civic presentations
 */

const initialSeedData = {
  complaints: [
    {
      id: "TKT-2026-0101",
      issueType: "roadside_dumping",
      issueTypeName: "Roadside Dumping",
      severity: "high",
      address: "Cross Road 4, Near Green Park Bus Stop",
      landmark: "Opposite Citizen Bakery, Kurla West",
      latitude: 19.0760,
      longitude: 72.8777,
      description: "Severe accumulation of unsegregated plastic bags, wet food refuse, and broken crates blocking pedestrian walkway.",
      photoUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=600&q=80",
      status: "Cleaning In Progress",
      createdAt: "2026-10-12T09:15:00.000Z",
      updatedAt: "2026-10-13T14:30:00.000Z",
      resolutionNote: "Sanitation Squad Unit 4 dispatched with mini-tipper truck. Site clearance underway.",
      afterPhotoUrl: null,
      assignedWorkerGroup: "Central Zone Squad 4",
      createdBy: "resident_citizen"
    },
    {
      id: "TKT-2026-0102",
      issueType: "overflowing_bin",
      issueTypeName: "Overflowing Public Bin",
      severity: "medium",
      address: "Corner of Market Street & Library Road",
      landmark: "Outside Central Metro Station Gate 2",
      latitude: 19.0820,
      longitude: 72.8850,
      description: "Twin secondary collection bins (Dry & Wet) overflowing with packaging paper and coconut shells into roadway.",
      photoUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
      status: "Resolved",
      createdAt: "2026-10-11T11:20:00.000Z",
      updatedAt: "2026-10-12T16:45:00.000Z",
      resolutionNote: "Compactor vehicle emptied both bins. Area sanitized with lime powder.",
      afterPhotoUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
      assignedWorkerGroup: "Market Zone Squad 2",
      createdBy: "resident_citizen"
    },
    {
      id: "TKT-2026-0103",
      issueType: "missed_doorstep_collection",
      issueTypeName: "Missed Door-to-Door Collection",
      severity: "low",
      address: "Silver Birch Apartments, Lane 3",
      landmark: "Behind Community Health Center",
      latitude: 19.0710,
      longitude: 72.8715,
      description: "Morning segregated collection vehicle did not service odd-numbered building wing.",
      photoUrl: "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=600&q=80",
      status: "Assigned",
      createdAt: "2026-10-13T08:45:00.000Z",
      updatedAt: "2026-10-13T10:00:00.000Z",
      resolutionNote: "Re-routed evening standby e-cart driver to complete missed sector pickup.",
      afterPhotoUrl: null,
      assignedWorkerGroup: "North Sector Squad 1",
      createdBy: "resident_citizen"
    },
    {
      id: "TKT-2026-0104",
      issueType: "hazardous_biomedical",
      issueTypeName: "Hazardous / Chemical Spillage",
      severity: "high",
      address: "Industrial Link Road, Plot 14-B",
      landmark: "Near Substation Transformer",
      latitude: 19.0680,
      longitude: 72.8920,
      description: "Dumped automobile batteries with corrosive electrolyte leakage onto stormwater drain rim.",
      photoUrl: "https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?auto=format&fit=crop&w=600&q=80",
      status: "Submitted",
      createdAt: "2026-10-14T06:30:00.000Z",
      updatedAt: "2026-10-14T06:30:00.000Z",
      resolutionNote: "Pending hazardous materials response team deployment.",
      afterPhotoUrl: null,
      assignedWorkerGroup: "Unassigned",
      createdBy: "resident_citizen"
    }
  ],

  pickupRequests: [
    {
      id: "REQ-2026-1049",
      wasteType: "e_waste",
      wasteTypeName: "Electronic & Electrical Waste (E-Waste)",
      description: "1 Old CRT Television, 2 discarded CPU cabinets, and bundled faulty power adapters.",
      quantityDescription: "3 units (~20 kg)",
      address: "Flat 402, Shanti Heights, 5th Avenue, Kurla West",
      preferredSlot: "Saturday Morning (09:00 AM - 12:00 PM)",
      status: "Scheduled",
      createdAt: "2026-10-12T14:10:00.000Z",
      createdBy: "resident_citizen"
    },
    {
      id: "REQ-2026-1050",
      wasteType: "bulky_furniture",
      wasteTypeName: "Bulky Household Furniture",
      description: "Dismantled wooden dining table and 4 broken chairs.",
      quantityDescription: "5 furniture items",
      address: "Bungalow 12, Riverview Enclave",
      preferredSlot: "Sunday Afternoon (02:00 PM - 05:00 PM)",
      status: "Request Received",
      createdAt: "2026-10-13T16:45:00.000Z",
      createdBy: "resident_citizen"
    }
  ],

  wasteGuideItems: [
    {
      id: "wg-01",
      itemName: "Vegetable & Fruit Peels",
      category: "wet_organic",
      categoryName: "Wet / Organic Waste",
      binColor: "green",
      binLabel: "Green Bin (Compostable)",
      instructions: "Place directly in green bin or home composting pit. Do not wrap in plastic or polythene carry bags.",
      localRuleNote: "Collected daily by door-to-door municipal collection wet-waste tipper.",
      specialHandlingWarning: "Drain excess liquids to avoid leachate odor."
    },
    {
      id: "wg-02",
      itemName: "Cooked Food & Rice Leftovers",
      category: "wet_organic",
      categoryName: "Wet / Organic Waste",
      binColor: "green",
      binLabel: "Green Bin (Compostable)",
      instructions: "Ensure bones or excessive oil are separated if using domestic vermicompost; otherwise safe for municipal wet bin.",
      localRuleNote: "Mandatory segregation under Solid Waste Management Rules.",
      specialHandlingWarning: "Keep bin lid sealed tightly to prevent pests."
    },
    {
      id: "wg-03",
      itemName: "Egg Shells & Seafood Waste",
      category: "wet_organic",
      categoryName: "Wet / Organic Waste",
      binColor: "green",
      binLabel: "Green Bin (Compostable)",
      instructions: "Crush shells slightly to accelerate microbial degradation. Rich in calcium for soil enrichment.",
      localRuleNote: "Standard organic waste stream.",
      specialHandlingWarning: "Do not leave in open air; cover with dry organic matter."
    },
    {
      id: "wg-04",
      itemName: "Tea Leaves & Coffee Grounds",
      category: "wet_organic",
      categoryName: "Wet / Organic Waste",
      binColor: "green",
      binLabel: "Green Bin (Compostable)",
      instructions: "Remove staples from tea bags before discarding. Fantastic organic nitrogen booster for garden soil.",
      localRuleNote: "Compostable organic matter.",
      specialHandlingWarning: "Synthetic pyramid tea bags contain plastic; cut and empty tea leaves into green bin."
    },
    {
      id: "wg-05",
      itemName: "Garden Leaves, Twigs & Nirmalya (Floral Waste)",
      category: "wet_organic",
      categoryName: "Wet / Organic Waste",
      binColor: "green",
      binLabel: "Green Bin (Compostable)",
      instructions: "Chop thick branches. Sacred pooja flowers (nirmalya) are routed to dedicated civic organic composting units.",
      localRuleNote: "Never burn dry leaves; open burning attracts civic penalties.",
      specialHandlingWarning: "Remove decorative ribbons, plastic threads, and pins before discarding flowers."
    },
    {
      id: "wg-06",
      itemName: "Cardboard Boxes & Delivery Cartons",
      category: "dry_recyclable",
      categoryName: "Dry / Recyclable Waste",
      binColor: "blue",
      binLabel: "Blue Bin (Recyclable)",
      instructions: "Flatten boxes to conserve space. Remove plastic adhesive tape and thermocol inserts before discarding.",
      localRuleNote: "Hand over dry to local scrap collectors (kabadiwala) or blue recycling bins.",
      specialHandlingWarning: "Keep dry; wet cardboard becomes unrecyclable."
    },
    {
      id: "wg-07",
      itemName: "Clean Plastic Water Bottles (PET)",
      category: "dry_recyclable",
      categoryName: "Dry / Recyclable Waste",
      binColor: "blue",
      binLabel: "Blue Bin (Recyclable)",
      instructions: "Rinse residual beverage, empty completely, compress flat, and recap bottle before placing in dry bin.",
      localRuleNote: "100% recyclable into polyester fiber and secondary bottles.",
      specialHandlingWarning: "Do not throw soiled or oily bottles without rinsing."
    },
    {
      id: "wg-08",
      itemName: "Rinsed Milk Pouches & Oil Packets",
      category: "dry_recyclable",
      categoryName: "Dry / Recyclable Waste",
      binColor: "blue",
      binLabel: "Blue Bin (Recyclable)",
      instructions: "Cut open one corner only (avoid cutting small detachment pieces), rinse interior with water, and let dry before binning.",
      localRuleNote: "High-grade recyclable low-density polyethylene (LDPE).",
      specialHandlingWarning: "Unrinsed pouches rot and spoil the entire dry recycling batch."
    },
    {
      id: "wg-09",
      itemName: "Newspapers, Books & Office Paper",
      category: "dry_recyclable",
      categoryName: "Dry / Recyclable Waste",
      binColor: "blue",
      binLabel: "Blue Bin (Recyclable)",
      instructions: "Tie with jute string or keep in paper bag. High commercial scrap value.",
      localRuleNote: "Recycled into newsprint and recycled kraft paper.",
      specialHandlingWarning: "Keep away from wet kitchen waste."
    },
    {
      id: "wg-10",
      itemName: "Aluminum Beverage Cans & Food Tins",
      category: "dry_recyclable",
      categoryName: "Dry / Recyclable Waste",
      binColor: "blue",
      binLabel: "Blue Bin (Recyclable)",
      instructions: "Rinse sauce residues. Aluminum can be recycled infinitely with 95% energy savings.",
      localRuleNote: "High value scrap metal.",
      specialHandlingWarning: "Push metal lids inside the tin to prevent sharp edges."
    },
    {
      id: "wg-11",
      itemName: "Glass Jars & Beverage Bottles",
      category: "dry_recyclable",
      categoryName: "Dry / Recyclable Waste",
      binColor: "blue",
      binLabel: "Blue Bin (Recyclable)",
      instructions: "Rinse food residues thoroughly. Keep intact whenever possible.",
      localRuleNote: "Infinitely recyclable material.",
      specialHandlingWarning: "Wrap broken glass in newspaper and clearly label 'Sharp Glass' to protect sanitation workers from injury."
    },
    {
      id: "wg-12",
      itemName: "Hard Plastic Shampoo & Detergent Bottles",
      category: "dry_recyclable",
      categoryName: "Dry / Recyclable Waste",
      binColor: "blue",
      binLabel: "Blue Bin (Recyclable)",
      instructions: "Rinse thoroughly with leftover water and compress slightly.",
      localRuleNote: "High-density polyethylene (HDPE) recyclable grade #2.",
      specialHandlingWarning: "Pump nozzles with metal springs should be detached."
    },
    {
      id: "wg-13",
      itemName: "Dry Cell Batteries (AA, AAA, 9V, Button Cells)",
      category: "hazardous",
      categoryName: "Domestic Hazardous / Chemical",
      binColor: "red",
      binLabel: "Red / Hazardous Drop-box",
      instructions: "Store in a dry plastic box at home. Bring to municipal battery collection centers or designated pharmacy bins.",
      localRuleNote: "Heavy metals (cadmium, lead, zinc) contaminate groundwater if landfilled.",
      specialHandlingWarning: "Tape the terminals of 9V and lithium batteries with scotch tape to prevent short circuits."
    },
    {
      id: "wg-14",
      itemName: "Expired Medicines & Syrup Bottles",
      category: "hazardous",
      categoryName: "Domestic Hazardous / Medical",
      binColor: "red",
      binLabel: "Pharmacy Return / Hazardous Bin",
      instructions: "Do not flush down sinks or flush into drains. Return to designated local chemist collection points.",
      localRuleNote: "Prevents antimicrobial resistance and river ecosystem toxicity.",
      specialHandlingWarning: "Keep medicines in blister strips to prevent accidental ingestion."
    },
    {
      id: "wg-15",
      itemName: "Fluorescent Tubes & Broken CFL Bulbs",
      category: "hazardous",
      categoryName: "Hazardous / Mercury-Containing",
      binColor: "red",
      binLabel: "Hazardous Drop Kiosk",
      instructions: "Handle gently without breaking glass. Place in original sleeve or cardboard wrapping before disposal.",
      localRuleNote: "Contains mercury vapor which is hazardous to human lungs.",
      specialHandlingWarning: "If broken, ventilate room for 15 minutes before sweeping with cardboard (never vacuum)."
    },
    {
      id: "wg-16",
      itemName: "Pesticide & Mosquito Repellent Refills",
      category: "hazardous",
      categoryName: "Domestic Hazardous / Poison",
      binColor: "red",
      binLabel: "Red Hazardous Bin",
      instructions: "Ensure cap is firmly screwed on. Do not puncture pressurized aerosol cans.",
      localRuleNote: "Treated as toxic chemical hazardous waste.",
      specialHandlingWarning: "Keep away from heat, flame, and children."
    },
    {
      id: "wg-17",
      itemName: "Paint Tins, Thinner & Chemical Solvents",
      category: "hazardous",
      categoryName: "Domestic Hazardous / Solvent",
      binColor: "red",
      binLabel: "Red Hazardous Bin",
      instructions: "Allow leftover paint to dry solid if small volume; otherwise hand over to hazardous waste collection drives.",
      localRuleNote: "Flammable VOC hazardous material.",
      specialHandlingWarning: "Never pour down domestic sewers or stormwater gutters."
    },
    {
      id: "wg-18",
      itemName: "Sanitary Napkins & Baby Diapers",
      category: "sanitary",
      categoryName: "Sanitary Waste (Red Dot Marked)",
      binColor: "black",
      binLabel: "Wrapped Paper / Red Dot Marked",
      instructions: "Wrap securely in multiple layers of newspaper or biodegradable disposal pouch. Mark with a distinct red dot.",
      localRuleNote: "Directed to high-temperature municipal incinerators to protect sanitation workers.",
      specialHandlingWarning: "Never flush down toilets or mix loosely with recyclables."
    },
    {
      id: "wg-19",
      itemName: "Used Face Masks, Bandages & Dressing Gauze",
      category: "sanitary",
      categoryName: "Sanitary & Biomedical",
      binColor: "black",
      binLabel: "Wrapped Paper / Red Dot Marked",
      instructions: "Wrap tightly in paper and mark with a red dot. Do not dispose loose.",
      localRuleNote: "Biomedical sanitation protocols apply.",
      specialHandlingWarning: "Treat as potentially infectious material."
    },
    {
      id: "wg-20",
      itemName: "Syringes, Needles & Diabetic Lancets",
      category: "sanitary",
      categoryName: "Sharps & Biomedical",
      binColor: "black",
      binLabel: "Rigid Puncture-Proof Container",
      instructions: "Never discard loose in bags. Place inside a thick-walled plastic bottle (e.g. laundry bottle), cap securely, and mark 'SHARPS - BIOMEDICAL'.",
      localRuleNote: "Critical protection rule for municipal sanitation workers.",
      specialHandlingWarning: "Recapping needles by hand is discouraged to avoid needle-stick injury."
    },
    {
      id: "wg-21",
      itemName: "Old Mobile Phones, Cables & Chargers",
      category: "e_waste",
      categoryName: "E-Waste (Electronics)",
      binColor: "special",
      binLabel: "Authorized E-Waste Kiosk",
      instructions: "Do not discard in household trash. Deposit at authorized civic e-waste collection kiosks or book a doorstep pickup.",
      localRuleNote: "Contains valuable copper/gold and toxic heavy metals.",
      specialHandlingWarning: "Do not burn or puncture lithium batteries."
    },
    {
      id: "wg-22",
      itemName: "Broken Laptops, Keyboards & Mice",
      category: "e_waste",
      categoryName: "E-Waste (Electronics)",
      binColor: "special",
      binLabel: "E-Waste Doorstep Pickup",
      instructions: "Schedule doorstep collection under Collections menu. Circuit boards are safely stripped and recycled.",
      localRuleNote: "Governed by E-Waste Management Rules.",
      specialHandlingWarning: "Remove confidential data before discarding storage drives."
    },
    {
      id: "wg-23",
      itemName: "Small Home Appliances (Kettles, Irons, Toasters)",
      category: "e_waste",
      categoryName: "E-Waste (Small Appliances)",
      binColor: "special",
      binLabel: "E-Waste Drop-off",
      instructions: "Bundle electrical cord neatly around the appliance. Drop at civic e-waste bins or book bulk pickup.",
      localRuleNote: "High metal recovery rate.",
      specialHandlingWarning: "Ensure appliance is disconnected from power."
    },
    {
      id: "wg-24",
      itemName: "Construction Debris, Ceramic Tiles & Plaster",
      category: "debris",
      categoryName: "C&D Debris (Construction & Demolition)",
      binColor: "special",
      binLabel: "Special Municipal Debris Booking",
      instructions: "Cannot be placed in regular wet/dry household bins. Book specialized municipal debris transport.",
      localRuleNote: "Routed to civic C&D recycling plants for manufacturing paver blocks and aggregate.",
      specialHandlingWarning: "Illegal dumping on roadsides or wetlands attracts strict penalties."
    }
  ],

  communityEvents: [
    {
      id: "evt-01",
      title: "Morning Plogging & Lakefront Cleanup",
      eventDate: "Saturday, 18 Oct 2026 • 07:00 AM - 09:30 AM",
      location: "Green Lake Promenade, Kurla Metro Hub",
      organizer: "Metro Green Volunteers & Municipal Sanitation Council",
      description: "Join fellow residents for a morning walk combined with litter picking along the lake trail. Gloves, litter sticks, and safety vests provided.",
      registrationCount: 28,
      maxCapacity: 50,
      rewardPoints: 100,
      isDemo: true
    },
    {
      id: "evt-02",
      title: "Neighborhood Composting & Zero-Waste Workshop",
      eventDate: "Sunday, 19 Oct 2026 • 10:00 AM - 12:00 PM",
      location: "Community Center Hall B, Sector 4",
      organizer: "Urban Agriculture & Soil Guild",
      description: "Learn how to turn kitchen scraps into rich black gold fertilizer for your plants. Free starter microbes packet for all attendees.",
      registrationCount: 42,
      maxCapacity: 60,
      rewardPoints: 75,
      isDemo: true
    },
    {
      id: "evt-03",
      title: "Quarterly E-Waste & Hazardous Drop-off Drive",
      eventDate: "Saturday, 25 Oct 2026 • 09:00 AM - 04:00 PM",
      location: "Civic Ground Parking, Near Central Market",
      organizer: "State Pollution Control Board & Municipal Recyclers",
      description: "Safely dispose of old electronics, dead lead batteries, expired chemicals, and tube lights with verified certificate.",
      registrationCount: 65,
      maxCapacity: 100,
      rewardPoints: 150,
      isDemo: true
    }
  ],

  rewards: {
    balance: 240,
    ledger: [
      {
        id: "tx-01",
        date: "2026-10-12",
        description: "Verified Accurate Report: Cross Road 4 Dumping",
        points: "+20 Pts",
        type: "earned"
      },
      {
        id: "tx-02",
        date: "2026-10-10",
        description: "Daily Segregation Challenge Streak (5-Day)",
        points: "+50 Pts",
        type: "earned"
      },
      {
        id: "tx-03",
        date: "2026-10-08",
        description: "Community Cleanup Volunteer Participation",
        points: "+100 Pts",
        type: "earned"
      },
      {
        id: "tx-04",
        date: "2026-10-05",
        description: "Doorstep E-Waste Handover Verification",
        points: "+70 Pts",
        type: "earned"
      }
    ],
    sampleCoupons: [
      {
        id: "cpn-01",
        title: "Free Native Sapling Voucher",
        partner: "Municipal Botanical Nursery",
        costPoints: 80,
        badge: "Gardening & Greenery",
        description: "Redeem for 1 native air-purifying plant sapling (Neem, Tulsi, or Bougainvillea) at civic center."
      },
      {
        id: "cpn-02",
        title: "10% Property Cleanliness Rebate Credit",
        partner: "Municipal Revenue Department",
        costPoints: 150,
        badge: "Civic Tax Credit",
        description: "Token adjustment certificate toward municipal solid waste service charges."
      },
      {
        id: "cpn-03",
        title: "Home Compost Microbe Culture (250g)",
        partner: "Green Soil Organics",
        costPoints: 120,
        badge: "Composting Kit",
        description: "Aerobic composting accelerator culture for fast odor-free kitchen waste decomposition."
      },
      {
        id: "cpn-04",
        title: "Civic Champion Certificate of Merit",
        partner: "City Sustainability Committee",
        costPoints: 200,
        badge: "Illustrative Demo Reward",
        description: "Official digital certificate of civic excellence in public hygiene."
      }
    ]
  },

  adminActivities: [
    {
      id: "act-01",
      complaintId: "TKT-2026-0101",
      oldStatus: "Under Review",
      newStatus: "Cleaning In Progress",
      note: "Dispatched Squad 4 with vehicle MH-01-TR-402 to clear roadside heap.",
      actorLabel: "Inspector R. Deshmukh (Central Zone)",
      timestamp: "2026-10-13T14:30:00.000Z"
    },
    {
      id: "act-02",
      complaintId: "TKT-2026-0102",
      oldStatus: "Cleaning In Progress",
      newStatus: "Resolved",
      note: "Dual-bins cleared and washed. Verified photo uploaded.",
      actorLabel: "Inspector R. Deshmukh (Central Zone)",
      timestamp: "2026-10-12T16:45:00.000Z"
    }
  ]
};

module.exports = initialSeedData;

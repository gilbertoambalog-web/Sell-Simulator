/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, PDV } from './types';

export const CATEGORIES = {
  "VINOS DEL AÑO": [
    { id: 'v1', name: "San Telmo", price: 2686 },
    { id: 'v2', name: "Suter", price: 2606 },
    { id: 'v3', name: "Alaris", price: 3127 },
    { id: 'v4', name: "F Las Moras", price: 3022 },
    { id: 'v5', name: "Fair For Life", price: 3963 },
    { id: 'v6', name: "El Bautismo", price: 3511 },
    { id: 'v7', name: "Cazador", price: 3407 },
    { id: 'v8', name: "Los Árboles", price: 3482 },
    { id: 'v9', name: "Alma Mora", price: 4318 },
    { id: 'v10', name: "Dadá", price: 4105 },
    { id: 'v11', name: "Elementos", price: 3757 },
    { id: 'v12', name: "Origen", price: 4407 },
    { id: 'v13', name: "Alma Mora Rva", price: 5198 },
    { id: 'v14', name: "Colección", price: 5486 },
    { id: 'v15', name: "Don David", price: 5775 },
    { id: 'v16', name: "Fond de Cave", price: 5608 },
    { id: 'v17', name: "Trapiche Reserva", price: 6117 }
  ],
  PREMIUM: [
    { id: 'p1', name: "Blend Extremos", price: 10343 },
    { id: 'p2', name: "Don David Rva", price: 7200 },
    { id: 'p3', name: "FDC Rva", price: 6962 },
    { id: 'p4', name: "Intocables", price: 6290 },
    { id: 'p5', name: "Puro Impuro", price: 7199 },
    { id: 'p6', name: "Puro Rose", price: 6119 },
    { id: 'p7', name: "Paz", price: 8001 },
    { id: 'p8', name: "NC Reserva", price: 7285 }
  ],
  ESPUMANTES: [
    { id: 'e1', name: "San Telmo", price: 4152 },
    { id: 'e2', name: "Dadá", price: 5990 },
    { id: 'e3', name: "Dadá Sidra", price: 4864 },
    { id: 'e4', name: "Navarro", price: 8420 },
    { id: 'e5', name: "Navarro lata", price: 3370 }
  ],
  RTD: [
    { id: 'r1', name: "Frizzé Bot", price: 2243 },
    { id: 'r2', name: "Frizzé Lata", price: 1512 },
    { id: 'r3', name: "Smirnoff ICE", price: 2245 },
    { id: 'r4', name: "Smirnoff BC", price: 2000 },
    { id: 'r5', name: "Gordon’s Tonic", price: 2240 }
  ],
  ANTARES: [
    { id: 'a1', name: "Lager", price: 1931 },
    { id: 'a2', name: "IPA S/A", price: 2077 },
    { id: 'a3', name: "Especial", price: 2310 }
  ],
  SPIRITS: [
    { id: 's1', name: "Gordon’s", price: 11060 },
    { id: 's2', name: "Gordon’s Pink", price: 11980 },
    { id: 's3', name: "Smirnoff original", price: 7093 },
    { id: 's4', name: "Smirnoff Flavors", price: 7800 },
    { id: 's5', name: "Tanqueray", price: 24390 },
    { id: 's6', name: "Tanqueray saborizado", price: 29283 },
    { id: 's7', name: "Red Label 750", price: 25440 },
    { id: 's8', name: "Red Label 1L", price: 30240 },
    { id: 's9', name: "Black Label 750", price: 47107 },
    { id: 's10', name: "Black Label 1L", price: 56046 },
    { id: 's11', name: "Double Black", price: 53633 },
    { id: 's12', name: "White Horse", price: 13300 },
    { id: 's13', name: "Baileys", price: 26059 },
    { id: 's14', name: "Baileys Caramel", price: 27402 }
  ]
};

export const INITIAL_CLIENTS: PDV[] = [
  { 
    id: "901-1", 
    name: "ZHENG CHANGI", 
    address: "AVDA SUAREZ 1957", 
    billing: "$ 82,868", 
    type: "AUTOSERVICIO A", 
    plans: ["CCC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CCC", "CNC", "CCC"], 
    portfolio: [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1] 
  },
  { 
    id: "901-2", 
    name: "AUT.SERV.D.C", 
    address: "PEPIRI 818", 
    billing: "$ 0", 
    type: "AUTOSERVICIO A", 
    plans: ["CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CCC", "CCC"], 
    portfolio: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1] 
  },
  { 
    id: "901-3", 
    name: "GAUNA LILIANA", 
    address: "AVDA AMANCIO ALCORTA 3330", 
    billing: "$ 54,698", 
    type: "AUTOSERVICIO A", 
    plans: ["CCC", "CCC", "CCC", "CCC", "CNC", "CCC", "CNC", "CNC", "CNC", "CNC", "CCC", "CNC"], 
    portfolio: [1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0] 
  },
  { 
    id: "901-4", 
    name: "WANG XIAOQIN", 
    address: "AVDA VELEZ SARSFIELD 1660", 
    billing: "$ 1,206,024", 
    type: "AUTOSERVICIO A", 
    plan: "SILVER",
    plans: ["CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CNC", "CCC", "CCC", "CNC"], 
    portfolio: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0] 
  },
  { 
    id: "901-5", 
    name: "XIE PINGFENG", 
    address: "AV AMANCIO ALCORTA 3395", 
    billing: "$ 1,247,616", 
    type: "AUTOSERVICIO A", 
    plans: ["CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CNC", "CCC", "CCC"], 
    portfolio: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1] 
  },
  { 
    id: "901-6", 
    name: "CHEN HONGYU", 
    address: "AVDA SAENZ 740", 
    billing: "$ 538,890", 
    type: "AUTOSERVICIO A", 
    plans: ["CCC", "CNC", "CCC", "CCC", "CNC", "CCC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC"], 
    portfolio: [1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0] 
  },
  { 
    id: "901-7", 
    name: "ZHENG MIANWEI", 
    address: "LUNA 472", 
    billing: "$ 315,005", 
    type: "AUTOSERVICIO A", 
    plans: ["CCC", "CNC", "CNC", "CCC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC"], 
    portfolio: [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0] 
  },
  { 
    id: "901-8", 
    name: "WANG LIQIN", 
    address: "AVDA AMANCIO ALCORTA 3676", 
    billing: "$ 219,204", 
    type: "AUTOSERVICIO A", 
    plan: "SILVER",
    plans: ["CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC"], 
    portfolio: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] 
  },
  { 
    id: "901-9", 
    name: "CHEN LIAN", 
    address: "JOSE CAMILO PAZ 2977", 
    billing: "$ 0", 
    type: "AUTOSERVICIO A", 
    plans: ["CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CCC", "CNC"], 
    portfolio: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0] 
  },
  { 
    id: "901-10", 
    name: "LIN SHENGBIAO", 
    address: "FAMATINA 3547", 
    billing: "$ 0", 
    type: "AUTOSERVICIO A", 
    plans: ["CNC", "CCC", "CCC", "CNC", "CNC", "CNC", "CNC", "CCC", "CNC", "CNC", "CNC", "CNC"], 
    portfolio: [0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0] 
  },
  { 
    id: "901-11", 
    name: "YANG QIAOMING", 
    address: "HIPOLITO VIEYTES 1431", 
    billing: "$ 343,824", 
    type: "AUTOSERVICIO A", 
    plans: ["CCC", "CCC", "CCC", "CCC", "CNC", "CCC", "CCC", "CNC", "CNC", "CNC", "CCC", "CCC"], 
    portfolio: [1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1] 
  },
  { 
    id: "901-12", 
    name: "XIAOMING XIE", 
    address: "IRIARTE 3375 3375", 
    billing: "$ 577,931", 
    type: "AUTOSERVICIO A", 
    plan: "INICIAL",
    plans: ["CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CNC", "CCC", "CCC", "CNC"], 
    portfolio: [1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0] 
  },
  { 
    id: "901-13", 
    name: "ZHANG JINGJING", 
    address: "SANTO DOMINGO 3819", 
    billing: "$ 1,231,030", 
    type: "AUTOSERVICIO A", 
    plan: "SILVER",
    plans: ["CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC"], 
    portfolio: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] 
  },
  { 
    id: "901-14", 
    name: "CHEN LINWANG", 
    address: "CALIFORNIA 2250", 
    billing: "$ 465,744", 
    type: "AUTOSERVICIO A", 
    plans: ["CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CCC"], 
    portfolio: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] 
  },
  { 
    id: "901-15", 
    name: "LI XINGHUA", 
    address: "ALVARADO 2701", 
    billing: "$ 0", 
    type: "AUTOSERVICIO A", 
    plans: ["CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC", "CNC"], 
    portfolio: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] 
  },
  { 
    id: "901-16", 
    name: "XIE PINGZHEN", 
    address: "PEPIRÍ 750", 
    billing: "$ 0", 
    type: "AUTOSERVICIO A", 
    plans: ["CNC", "CCC", "CCC", "CCC", "CNC", "CCC", "CCC", "CNC", "CNC", "CNC", "CNC", "CCC"], 
    portfolio: [0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1] 
  },
  { 
    id: "901-17", 
    name: "LIN CHEN", 
    address: "AV. GRAL. TOMÁS DE IRIARTE 2757", 
    billing: "$ 899,498", 
    type: "AUTOSERVICIO A", 
    plan: "INICIAL",
    plans: ["CCC", "CCC", "CCC", "CCC", "CCC", "CCC", "CNC", "CCC", "CNC", "CNC", "CCC", "CCC"], 
    portfolio: [1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1] 
  },
  { 
    id: "902-1", 
    name: "WANG XIAMEI", 
    address: "ZUVIRIA 3229", 
    billing: "$ 125,590", 
    type: "AUTOSERVICIO A", 
    plan: "SILVER",
    plans: ["CCC", "CCC", "CNC", "CCC", "CCC", "CNC", "CCC", "CCC", "CCC", "CCC", "CCC", "CNC"], 
    portfolio: [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0] 
  }
];

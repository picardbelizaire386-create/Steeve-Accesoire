/**
 * Validation et utilitaires pour la conformité exclusive :
 * 1. Utilisateurs haïtiens avec indicatif obligatoire (+509)
 * 2. Achats, commandes et livraisons exclusivement réservés à la Commune des Cayes (Sud d'Haïti)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  error?: string;
}

/**
 * Valide strictement un numéro de téléphone haïtien (+509).
 * Seuls les numéros avec l'indicatif +509 et 8 chiffres sont acceptés.
 * Les indicatifs étrangers sont systématiquement rejetés.
 */
export function validateHaitianPhone(input: string): PhoneValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      formatted: '',
      error: 'Le numéro de téléphone haïtien (+509) est obligatoire.',
    };
  }

  const cleaned = input.trim().replace(/\s+/g, '').replace(/[-().]/g, '');

  // Vérifier si l'utilisateur a saisi un indicatif étranger (ex: +1, +33, +44, +590, etc.)
  if (cleaned.startsWith('+') && !cleaned.startsWith('+509')) {
    return {
      isValid: false,
      formatted: input,
      error: 'Seuls les numéros haïtiens avec le préfixe (+509) sont éligibles sur STEEVE ACCESSOIRE.',
    };
  }

  // Si commence par 00509 ou 509 ou +509
  let digits = '';
  if (cleaned.startsWith('+509')) {
    digits = cleaned.slice(4);
  } else if (cleaned.startsWith('00509')) {
    digits = cleaned.slice(5);
  } else if (cleaned.startsWith('509') && cleaned.length >= 11) {
    digits = cleaned.slice(3);
  } else if (cleaned.length === 8 && /^\d{8}$/.test(cleaned)) {
    // L'utilisateur a saisi directement les 8 chiffres haïtiens sans préfixe
    digits = cleaned;
  } else {
    return {
      isValid: false,
      formatted: input,
      error: 'Le numéro doit obligatoirement débuter par le préfixe haïtien (+509) suivi de 8 chiffres.',
    };
  }

  // Vérifier que digits ne contient que des chiffres et a exactement 8 caractères
  if (!/^\d{8}$/.test(digits)) {
    if (digits.length < 8) {
      return {
        isValid: false,
        formatted: `+509 ${digits}`,
        error: `Numéro incomplet : 8 chiffres requis après +509 (${digits.length}/8 saisis).`,
      };
    } else {
      return {
        isValid: false,
        formatted: `+509 ${digits}`,
        error: 'Un numéro haïtien comporte exactement 8 chiffres après le préfixe (+509).',
      };
    }
  }

  // En Haïti, les numéros mobiles commencent généralement par 3 (Digicel), 4 (Natcom/Digicel) ou 2 (Natcom fixe/mobile)
  const firstDigit = digits.charAt(0);
  if (!['2', '3', '4', '5'].includes(firstDigit)) {
    return {
      isValid: false,
      formatted: `+509 ${digits}`,
      error: 'Numéro haïtien non reconnu. Les numéros mobiles débutent généralement par 3 (Digicel) ou 4 (Natcom).',
    };
  }

  const formatted = `+509 ${digits.slice(0, 4)} ${digits.slice(4)}`;
  return {
    isValid: true,
    formatted,
  };
}

/**
 * Formatage en direct lors de la frappe d'un numéro haïtien
 */
export function formatHaitianPhoneInput(value: string): string {
  // S'assurer que le champ commence toujours par +509
  const cleaned = value.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+509')) {
    const rawDigits = cleaned.replace(/\D/g, '');
    if (rawDigits.startsWith('509')) {
      const remaining = rawDigits.slice(3, 11);
      return remaining.length > 4 
        ? `+509 ${remaining.slice(0, 4)} ${remaining.slice(4)}`
        : `+509 ${remaining}`;
    } else {
      const remaining = rawDigits.slice(0, 8);
      return remaining.length > 4 
        ? `+509 ${remaining.slice(0, 4)} ${remaining.slice(4)}`
        : remaining ? `+509 ${remaining}` : '+509 ';
    }
  }

  const digits = cleaned.slice(4).replace(/\D/g, '').slice(0, 8);
  if (digits.length > 4) {
    return `+509 ${digits.slice(0, 4)} ${digits.slice(4)}`;
  } else if (digits.length > 0) {
    return `+509 ${digits}`;
  }
  return '+509 ';
}

/**
 * Liste officielle des quartiers et zones de la Commune des Cayes (Sud d'Haïti)
 * Point de référence : Breffette (Siège STEEVE ACCESSOIRE)
 */
export interface CayesZone {
  name: string;
  approxKm: number;
  description: string;
}

export const CAYES_COMMUNE_ZONES: CayesZone[] = [
  { name: 'Breffette (Siège STEEVE ACCESSOIRE)', approxKm: 1.0, description: 'Boutique & expédition immédiate' },
  { name: 'Centre-ville Les Cayes (Place d\'Armes / Cathédrale)', approxKm: 2.2, description: 'Cœur historique de la commune' },
  { name: 'Vernet', approxKm: 2.5, description: 'Quartier résidentiel des Cayes' },
  { name: 'La Savane', approxKm: 3.0, description: 'Commune des Cayes' },
  { name: 'Gabions / Carrefour Méridien', approxKm: 3.5, description: 'Zone commerciale & résidentielle' },
  { name: 'Bourdet', approxKm: 4.0, description: 'Commune des Cayes Sud' },
  { name: 'Charpentier', approxKm: 4.5, description: 'Commune des Cayes Sud' },
  { name: 'Bergeaud / Carrefour 44', approxKm: 5.5, description: 'Entrée nord de la ville des Cayes' },
  { name: 'Béraud', approxKm: 6.0, description: 'Section communale des Cayes' },
  { name: 'Gelée (Plage & Zone balnéaire)', approxKm: 7.0, description: 'Commune des Cayes Sud' },
  { name: 'Laborde', approxKm: 8.0, description: 'Section communale des Cayes' },
  { name: 'Fonfred', approxKm: 8.5, description: 'Section communale des Cayes' },
  { name: 'Polycarpe / Châteaulin', approxKm: 9.2, description: 'Commune des Cayes Sud' },
];

/**
 * Rayon maximal de livraison à l'intérieur de la commune des Cayes (en km depuis Breffette)
 * La commune des Cayes s'étend jusqu'à ~15 km du centre.
 */
export const MAX_CAYES_COMMUNE_RADIUS_KM = 15;

/**
 * Coordonnées de base du magasin : Breffette, Les Cayes, Haïti
 */
export const BREFFETTE_STORE_COORDS = {
  latitude: 18.2045,
  longitude: -73.7478,
  commune: 'Les Cayes',
  departement: 'Sud',
  pays: 'Haïti',
};

/**
 * Vérification d'éligibilité pour les achats, commandes et livraisons :
 * Strictement réservés à la commune des Cayes dans le Sud d'Haïti.
 */
export function validateCayesEligibility(
  city: string,
  addressLine: string,
  distanceKm?: number
): { isEligible: boolean; error?: string } {
  const normalizedCity = (city || '').toLowerCase().trim();
  const normalizedAddr = (addressLine || '').toLowerCase().trim();

  // Liste des termes valides désignant la commune des Cayes ou ses quartiers
  const validCayesKeywords = [
    'cayes',
    'les cayes',
    'aux cayes',
    'breffette',
    'vernet',
    'savane',
    'gabions',
    'bourdet',
    'charpentier',
    'bergeaud',
    'béraud',
    'beraud',
    'gelée',
    'gelee',
    'laborde',
    'fonfred',
    'chateaulin',
    'châteaulin',
    'polycarpe',
    'dérangé',
    'derange',
    'meridien',
    'méridien',
    'place d\'armes',
  ];

  const matchesCity = validCayesKeywords.some(k => normalizedCity.includes(k));
  const matchesAddr = validCayesKeywords.some(k => normalizedAddr.includes(k));

  if (!matchesCity && !matchesAddr) {
    return {
      isEligible: false,
      error: 'Les achats, commandes et livraisons sont exclusivement réservés aux résidents de la commune des Cayes (Sud d\'Haïti). Veuillez renseigner une adresse située dans la commune des Cayes.',
    };
  }

  // Vérification de la distance si le GPS est activé
  if (distanceKm !== undefined && distanceKm > MAX_CAYES_COMMUNE_RADIUS_KM) {
    return {
      isEligible: false,
      error: `La position indiquée se trouve à ${distanceKm.toFixed(1)} km de notre siège à Breffette, ce qui dépasse le périmètre de la commune des Cayes (${MAX_CAYES_COMMUNE_RADIUS_KM} km max). Seule la commune des Cayes est éligible à la livraison.`,
    };
  }

  return {
    isEligible: true,
  };
}

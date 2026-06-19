/*
  Zentrale Liste aller Vereins-Partner & Sponsoren.
  Wird auf Startseite (Partner-Leiste), Sponsoring-Seite (Raster)
  und Turnierseite (Vorstellung) verwendet – nur hier pflegen!

  Logos liegen in public/sponsoren/.
  - featured: Hauptpartner (wird hervorgehoben)
  - url: null  -> Logo wird nicht verlinkt
*/
export interface Partner {
  /** Anzeigename */
  name: string
  /** Pfad zum Logo in public/ */
  logo: string
  /** Website oder Social-Media-Profil; null = nicht verlinkt */
  url: string | null
  /** Hauptpartner hervorheben */
  featured?: boolean
  /** Kurzvorstellung (1–2 Sätze) für die Turnierseite */
  description: string
}

export const partners: Partner[] = [
  {
    name: 'SilberHolz',
    logo: '/sponsoren/Silberholz-logo.png',
    url: 'https://www.silberholz.at/',
    featured: true,
    description:
      'SilberHolz ist eine Tischlerei aus der Region, die nachhaltig gefertigte Küchen und Möbel für Haus und Garten herstellt – getreu dem Motto „Natürlich SilberHolz".',
  },
  {
    name: 'Raiffeisenbank Gunskirchen',
    logo: '/sponsoren/raiffeisen-gunskirchen.svg',
    url: 'https://www.raiffeisen.at/ooe/gunskirchen/de/privatkunden.html',
    description:
      'Die Raiffeisenbank Gunskirchen ist die Bank in der Region und begleitet Privat- und Firmenkund:innen in allen Geldfragen – fest verwurzelt in Oberösterreich.',
  },
  {
    name: 'XXXLutz',
    logo: '/sponsoren/xxxlutz-2018.jpg',
    url: 'https://www.xxxlutz.at/',
    description:
      'XXXLutz mit Wurzeln im oberösterreichischen Wels zählt zu den größten Möbelhändlern der Welt – mit riesiger Auswahl an Möbeln und Wohnaccessoires für jeden Geschmack und jedes Budget.',
  },
  {
    name: 'Felbermair Keramikwelt',
    logo: '/sponsoren/Felbermair-Brand.svg',
    url: 'https://felbermair.at/',
    description:
      'Felbermair ist der Spezialist für Fliesen, Keramik und Natursteine mit Showroom in Gunskirchen – mit stilvollen Lösungen für Wohnraum, Küche, Bad, Fassade und Terrasse.',
  },
  {
    name: 'Poschacher',
    logo: '/sponsoren/Poschacher.png',
    url: 'https://www.instagram.com/spar.poschacher',
    description:
      'Die SPAR-Märkte Poschacher in Offenhausen und Gunskirchen sind die freundlichen Nahversorger ums Eck und versorgen die Region mit frischen Lebensmitteln und allem für den täglichen Bedarf.',
  },
  {
    name: 'Reinthaler Bau',
    logo: '/sponsoren/reinthaler-logo-weiss.webp',
    url: 'https://www.reinthaler-bau.at/',
    description:
      'Die Bauunternehmung Reinthaler aus Offenhausen baut seit 1961 auf wertbeständigen Massivbau – vom privaten Wohnbau über Gewerbe- und Sakralbau bis hin zu Umbau und Sanierung.',
  },
  {
    name: 'Ganic',
    logo: '/sponsoren/Vitaminwater-Logo-2016.png',
    url: 'https://www.vitaminwater.at/ganic-sport/',
    description:
      'Ganic sport ist ein österreichisches Vitaminwasser mit Mango-Zitrus-Geschmack – kalorienarm und mit L-Carnitin, Calcium & Magnesium die perfekte Erfrischung für vor, während und nach dem Match.',
  },
  {
    name: 'VR Frag',
    logo: '/sponsoren/VRFragLogo.webp',
    url: 'https://www.vrfrag.com/',
    description:
      'VR Frag in Amstetten bringt Virtual-Reality-Action auf zwei großen Indoor-Spielflächen – taktische Multiplayer-Matches für Gruppen, quasi Paintball und Counter-Strike in echt.',
  },
]

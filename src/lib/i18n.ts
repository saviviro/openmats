export type Locale = "fi" | "en";

export const intlLocale: Record<Locale, string> = {
  fi: "fi-FI",
  en: "en-GB",
};

export const ui = {
  fi: {
    description:
      "Pääkaupunkiseudun BJJ- ja lukkopaini-open matit yhdessä paikassa.",
    homeLabel: "Open Mats, etusivu",
    languageLabel: "Kieli",
    skipLink: "Siirry tapahtumiin",
    heroTitle: "Löydä seuraava",
    heroOpenMat: "open mat.",
    heroLead:
      "Pääkaupunkiseudun BJJ- ja lukkopaini-open matit koottuna selkeäksi listaksi. Tarkista tiedot aina järjestäjän alkuperäisestä lähteestä.",
    heroAction: "Selaa tapahtumia",
    noticeLabel: "Tapahtumatietojen huomautus",
    lastChecked: "Tiedot on viimeksi koottu ja tarkistettu tekoälyn avulla",
    sourceReminder:
      "Ajantasaiset tiedot kannattaa tarkistaa järjestäjän sivuilta.",
    upcoming: "Tulevat open matit",
    sectionTitle: "Valitse aika ja paikka",
    sectionLead: "Suodata tapahtumia kaupungin, tyylin tai hinnan mukaan.",
    filterEyebrow: "Rajaa listaa",
    city: "Kaupunki",
    style: "Tyyli",
    price: "Hinta",
    all: "Kaikki",
    free: "Ilmainen",
    paid: "Maksullinen",
    unknown: "Ei tietoa",
    eventStyleLabel: "Open matin tyyli",
    available: "sallittu",
    unavailable: "ei sallittu",
    unknownFormat: "ei tietoa",
    unknownFormatNote: "Ei tietoa – tarkista järjestäjältä",
    cancelled: "Peruttu",
    rescheduled: "Siirretty",
    time: "Aika",
    venue: "Paikka",
    audience: "Kenelle",
    organizerPage: "Järjestäjän sivu",
    organizerLink: "Järjestäjän sivuille",
    exceptions: "Poikkeukset",
    registrationRequired: "Ilmoittautuminen vaaditaan",
    opensNewTab: "avautuu uuteen välilehteen",
    dateAria: "Päivä",
    paginationLabel: "Tapahtumalistan sivut",
    previous: "Edellinen",
    next: "Seuraava",
    page: "Sivu",
    emptyTitle: "Ei osumia näillä rajauksilla.",
    emptyLead: "Kokeile toista kaupunkia, tyyliä tai hintaa.",
    feedbackLink: "Ilmoita virheestä tai puuttuvasta open matista",
    privacyLink: "Tietosuoja ja yhteystiedot",
    footer:
      "Koontipalvelu ei järjestä tapahtumia. Varmista tiedot aina alkuperäisestä lähteestä.",
  },
  en: {
    description:
      "Brazilian jiu-jitsu and submission wrestling open mats across the Helsinki region.",
    homeLabel: "Open Mats, home page",
    languageLabel: "Language",
    skipLink: "Skip to events",
    heroTitle: "Find your next",
    heroOpenMat: "open mat.",
    heroLead:
      "Brazilian jiu-jitsu and submission wrestling open mats across the Helsinki region, collected in one clear list. Always confirm the details on the organizer’s original page.",
    heroAction: "Browse events",
    noticeLabel: "Event information notice",
    lastChecked:
      "The details were last collected and checked with AI assistance on",
    sourceReminder:
      "Current details are worth checking on the organizer’s page.",
    upcoming: "Upcoming open mats",
    sectionTitle: "Choose a time and place",
    sectionLead: "Filter events by city, style, or price.",
    filterEyebrow: "Filter the list",
    city: "City",
    style: "Style",
    price: "Price",
    all: "All",
    free: "Free",
    paid: "Paid",
    unknown: "Unknown",
    eventStyleLabel: "Open mat style",
    available: "allowed",
    unavailable: "not allowed",
    unknownFormat: "unknown",
    unknownFormatNote: "Unknown – check with the organizer",
    cancelled: "Cancelled",
    rescheduled: "Rescheduled",
    time: "Time",
    venue: "Venue",
    audience: "Who can attend",
    organizerPage: "Organizer’s page",
    organizerLink: "Open organizer’s page",
    exceptions: "Exceptions",
    registrationRequired: "Registration required",
    opensNewTab: "opens in a new tab",
    dateAria: "Date",
    paginationLabel: "Event list pages",
    previous: "Previous",
    next: "Next",
    page: "Page",
    emptyTitle: "No events match these filters.",
    emptyLead: "Try another city, style, or price.",
    feedbackLink: "Report an error or a missing open mat",
    privacyLink: "Privacy and contact details",
    footer:
      "This listing service does not organize the events. Always confirm the details from the original source.",
  },
} as const;

export interface EventTranslation {
  priceNote: string;
  accessDescription: string;
  exceptionNote: string;
}

export const englishSeriesTranslations: Record<string, EventTranslation> = {
  "aogg-erottaja-sunday-nogi-open-mat": {
    priceNote: "The source does not state an open-mat visitor price",
    accessDescription:
      "Open to practitioners from other clubs. No-gi only; reserve a spot in advance.",
    exceptionNote: "The official calendar does not list cancelled dates.",
  },
  "aogg-sornainen-colored-belts-nogi-open-mat": {
    priceNote: "The source does not state an open-mat visitor price",
    accessDescription:
      "Open to coloured belts from other clubs. No-gi only; reserve a spot in advance.",
    exceptionNote:
      "The official calendar does not list cancelled dates. The session is for coloured belts.",
  },
  "buli-urhea-sunday-open-mat": {
    priceNote: "Open-mat membership €25 per calendar year",
    accessDescription:
      "Contact Buli in advance before visiting or trying the open mat. Gi or no-gi.",
    exceptionNote:
      "The membership page lists a weekly Sunday session, but the dated calendar has no matching event. Confirm the date before attending.",
  },
  "dojo-helsinki-saturday-nogi-open-mat": {
    priceNote: "The source does not state a visitor price",
    accessDescription: "Open to practitioners from other clubs. No-gi attire.",
    exceptionNote:
      "Dojo announces holiday changes and additional open mats on Instagram.",
  },
  "gb-gym-monthly-open-mat": {
    priceNote: "Free of charge",
    accessDescription: "Open to all practitioners. Gi or no-gi.",
    exceptionNote: "No known exceptions.",
  },
  "hjjk-saturday-open-mat": {
    priceNote: "The source does not state a visitor price",
    accessDescription: "Open to practitioners from other clubs.",
    exceptionNote:
      "The session is held only when the venue has no other event. No overlapping BJJ event was found during the reviewed publication window.",
  },
  "hipko-metsala-saturday-bjj-open-mat": {
    priceNote: "The source does not state an open-mat visitor price",
    accessDescription:
      "The summer timetable does not state whether practitioners from other clubs may attend. Confirm participation with HIPKO.",
    exceptionNote:
      "The official summer timetable is valid through 9 August 2026. The session is unsupervised.",
  },
  "hipko-metsala-sunday-bjj-open-mat": {
    priceNote: "The source does not state an open-mat visitor price",
    accessDescription:
      "The summer timetable does not state whether practitioners from other clubs may attend. Confirm participation with HIPKO.",
    exceptionNote:
      "The official summer timetable is valid through 9 August 2026. The session is unsupervised.",
  },
  "kilo-jiu-jitsu-saturday-open-mat": {
    priceNote: "The source does not state an open-mat visitor price",
    accessDescription: "Open to practitioners from other clubs.",
    exceptionNote:
      "The gym’s official web schedule is still labelled 2023, so confirm the attire and current schedule with the organizer.",
  },
  "loop-saturday-open-mat": {
    priceNote: "Free of charge",
    accessDescription: "Open to all practitioners. Gi or no-gi.",
    exceptionNote:
      "No known exceptions. The summer schedule ends on 2 August 2026.",
  },
  "mma-vantaa-sunday-open-mat": {
    priceNote: "The source does not state a visitor price",
    accessDescription:
      "Open to visitors from other clubs. Be at the door before the session starts, because entry requires a member’s door code.",
    exceptionNote:
      "The official summer schedule is valid through 9 August 2026. Attire is not specified.",
  },
  "takado-tuesday-open-mat": {
    priceNote: "The source does not state an open-mat visitor price",
    accessDescription:
      "Open to everyone. Enroll for the session through myClub.",
    exceptionNote:
      "The official timetable does not list dated exceptions. Attire is not specified.",
  },
  "takado-saturday-open-mat": {
    priceNote: "The source does not state an open-mat visitor price",
    accessDescription:
      "Open to everyone. Enroll for the session through myClub.",
    exceptionNote:
      "The official timetable does not list dated exceptions. Attire is not specified.",
  },
  "tundra-saturday-open-mat": {
    priceNote: "The source does not state an open-mat visitor price",
    accessDescription:
      "Open to members of other clubs. Contact the gym before visiting during summer.",
    exceptionNote:
      "The gym notes that summer exceptions are possible and asks visitors to get in touch before attending.",
  },
};

export const englishEventTranslationOverrides: Record<
  string,
  Partial<EventTranslation>
> = {};

export function getEventTranslation(
  locale: Locale,
  eventId: string,
  seriesId: string,
  finnish: EventTranslation,
): EventTranslation {
  if (locale === "fi") return finnish;

  const translation = englishSeriesTranslations[seriesId];
  if (!translation) {
    throw new Error(`Missing English event translation for ${seriesId}`);
  }
  return {
    ...translation,
    ...englishEventTranslationOverrides[eventId],
  };
}

import type { Partner } from "./types";

const profiles = [
  ["greiner", "GREINER", "Greiner is a family-run German company with more than 100 years of experience. It is one of the leading producers of specialised seating and chairs for demanding applications in the medical sector.", "Greiner on yli 100-vuotias saksalainen perheyritys. Se kuuluu lääkinnällisen alan vaativiin käyttökohteisiin suunniteltujen erikoisistuimien ja -tuolien johtaviin valmistajiin."],
  ["promotal", "PROMOTAL", "Promotal develops professional medical furniture for examination, treatment and care environments, with a focus on practical ergonomics, patient accessibility and efficient clinical work.", "Promotal kehittää ammattikäyttöön tarkoitettuja lääkinnällisiä kalusteita tutkimus-, hoito- ja hoivaympäristöihin. Ratkaisuissa painottuvat ergonomia, esteettömyys ja sujuva kliininen työ."],
  ["novak-m", "NOVAK-M", "NOVAK M develops medical equipment for patient examination, treatment and transport. Its solutions are designed to support dependable everyday workflows across healthcare facilities.", "NOVAK M kehittää potilaiden tutkimukseen, hoitoon ja kuljetukseen tarkoitettuja lääkinnällisiä laitteita, jotka tukevat terveydenhuollon luotettavia päivittäisiä työnkulkuja."],
  ["la-pastilla", "LA PASTILLA", "La Pastilla creates mobile furniture and organised storage solutions for healthcare professionals, helping essential equipment remain accessible wherever clinical teams need it.", "La Pastilla suunnittelee terveydenhuollon ammattilaisille liikuteltavia kalusteita ja järjestelmällisiä säilytysratkaisuja, joiden avulla tärkeät välineet ovat helposti saatavilla."],
  ["aga", "AGA", "AGA provides a broad range of examination, treatment and specialist medical furniture designed for professional healthcare environments and varied clinical applications.", "AGA tarjoaa laajan valikoiman tutkimus-, hoito- ja erikoiskalusteita ammattimaisiin terveydenhuollon ympäristöihin ja erilaisiin kliinisiin käyttötarkoituksiin."],
  ["famed", "FAMED", "Famed develops hospital equipment and medical furniture for patient care, treatment and maternity environments, combining practical functionality with the needs of clinical teams.", "Famed kehittää sairaalalaitteita ja lääkinnällisiä kalusteita potilashoitoon, toimenpiteisiin ja äitiyshuoltoon yhdistäen käytännölliset toiminnot kliinisten tiimien tarpeisiin."],
  ["meguard", "MeGUARD", "MeGUARD focuses on face and personal protection solutions for clinical environments, with products designed to support clear visibility, hygiene and comfortable daily use.", "MeGUARD keskittyy kliinisten ympäristöjen kasvo- ja henkilösuojausratkaisuihin, joissa huomioidaan hyvä näkyvyys, hygienia ja miellyttävä päivittäinen käyttö."],
  ["otopront", "OTOPRONT", "OTOPRONT specialises in ENT treatment units, examination chairs and supporting equipment that bring essential tools together for focused ear, nose and throat care.", "OTOPRONT on erikoistunut KNK-hoitoyksiköihin, tutkimustuoleihin ja niitä täydentäviin laitteisiin, jotka kokoavat keskeiset työkalut sujuvaa korva-, nenä- ja kurkkutautien hoitoa varten."],
] as const;

export const partnerPlaceholders: Partner[] = profiles.map(([code, title, english, finnish], index) => ({
  id: `placeholder-${code}`,
  code,
  imageUrl: "",
  isPublished: code !== "otopront",
  sortOrder: (index + 1) * 10,
  translationStatus: "ready",
  translationError: "",
  translatedAt: "",
  translationSourceUpdatedAt: "",
  updatedAt: "",
  translations: {
    en: { locale: "en", title, description: english },
    fi: { locale: "fi", title, description: finnish },
  },
}));

begin;

-- Keep one intentional sample project. These five rows were seeded by the
-- preceding reference-project migration and contain no user-authored content.
delete from public.reference_projects
where slug in (
  'modern-dialysis-centre',
  'welcoming-care-home-interiors',
  'womens-health-clinic',
  'emergency-unit-renewal',
  'patient-friendly-dental-centre'
);

update public.reference_projects
set gallery_urls = array['/images/chair1.png'],
    translation_status = 'ready',
    translation_error = null,
    translated_at = now(),
    translation_source_updated_at = now()
where slug = 'central-hospital-care-environments';

update public.reference_project_translations
set title = 'Creating calmer, more practical care environments for a central hospital',
    summary = 'A coordinated furniture project that brought patient comfort, dependable clinical workflows and long-term everyday use into one considered solution.',
    location = 'Hämeenlinna, Finland',
    unit = 'Patient care areas',
    meta_title = 'Central Hospital Care Environments | Woittola References',
    meta_description = 'The story behind a coordinated healthcare furniture project created for modern hospital care environments.',
    content_blocks = jsonb_build_array(
      jsonb_build_object(
        'id', 'starting-point',
        'type', 'text',
        'heading', 'A shared starting point',
        'body', E'The hospital needed furniture that could support several different care situations without making the environment feel clinical or fragmented. Every space had its own routines, yet patients and professionals needed the same sense of clarity, comfort and confidence throughout the building.\n\nWe began by listening to the people using the rooms every day. Their experience helped define what truly mattered: easy access for care teams, intuitive adjustment, straightforward cleaning and seating that would remain comfortable during longer appointments.',
        'imageUrls', '[]'::jsonb,
        'imageAlt', '',
        'caption', '',
        'imagePosition', 'right'
      ),
      jsonb_build_object(
        'id', 'considered-selection',
        'type', 'text',
        'heading', 'Turning daily needs into a considered selection',
        'body', E'Rather than treating each room as a separate purchase, the project was approached as one connected care environment. Patient chairs, treatment furniture and supporting equipment were evaluated together so that movement, maintenance and visual consistency would work across departments.\n\nThe final selection balances durability with a calm appearance. Controls remain close at hand, surfaces are practical to maintain and each product supports the working positions required by clinical staff.',
        'imageUrls', '[]'::jsonb,
        'imageAlt', '',
        'caption', '',
        'imagePosition', 'right'
      ),
      jsonb_build_object(
        'id', 'lasting-result',
        'type', 'image-text',
        'heading', 'A solution designed to last',
        'body', E'The completed spaces now feel consistent without becoming repetitive. Care teams can move confidently between rooms, while patients encounter furniture that feels approachable and supportive.\n\nMost importantly, the solution is prepared for everyday reality: frequent use, changing patient needs and the high standards expected from a modern healthcare environment.',
        'imageUrls', jsonb_build_array('/images/chair1.png'),
        'imageAlt', 'Patient chair selected for the central hospital care environment',
        'caption', 'A carefully selected patient chair supporting comfort and practical daily care.',
        'imagePosition', 'right'
      )
    )
where locale = 'en'
  and project_id = (select id from public.reference_projects where slug = 'central-hospital-care-environments');

update public.reference_project_translations
set title = 'Rauhallisempia ja toimivampia hoitoympäristöjä keskussairaalaan',
    summary = 'Yhtenäinen kalusteprojekti, jossa potilasmukavuus, sujuvat kliiniset työnkulut ja pitkäaikainen päivittäinen käyttö yhdistyvät harkituksi kokonaisuudeksi.',
    location = 'Hämeenlinna, Suomi',
    unit = 'Potilashoidon tilat',
    meta_title = 'Keskussairaalan hoitoympäristöt | Woittolan referenssit',
    meta_description = 'Tarina moderniin sairaalaympäristöön suunnitellun yhtenäisen terveydenhuollon kalusteprojektin takana.',
    content_blocks = jsonb_build_array(
      jsonb_build_object(
        'id', 'starting-point',
        'type', 'text',
        'heading', 'Yhteinen lähtökohta',
        'body', E'Sairaala tarvitsi kalusteita, jotka tukevat erilaisia hoitotilanteita ilman, että ympäristö tuntuu kliiniseltä tai hajanaiselta. Jokaisella tilalla oli omat rutiininsa, mutta potilaat ja ammattilaiset tarvitsivat kaikkialla samaa selkeyden, mukavuuden ja luottamuksen tunnetta.\n\nAloitimme kuuntelemalla ihmisiä, jotka käyttävät tiloja päivittäin. Heidän kokemuksensa auttoi tunnistamaan olennaisen: esteettömän työskentelyn, intuitiiviset säädöt, helpon puhdistettavuuden ja istuimet, jotka pysyvät mukavina myös pidempien hoitokäyntien aikana.',
        'imageUrls', '[]'::jsonb,
        'imageAlt', '',
        'caption', '',
        'imagePosition', 'right'
      ),
      jsonb_build_object(
        'id', 'considered-selection',
        'type', 'text',
        'heading', 'Arjen tarpeista harkituksi kokonaisuudeksi',
        'body', E'Yksittäisten huoneiden erillisten hankintojen sijaan projekti nähtiin yhtenäisenä hoitoympäristönä. Potilastuolit, hoitokalusteet ja täydentävät laitteet arvioitiin yhdessä, jotta liikkuminen, ylläpito ja visuaalinen yhtenäisyys toimivat osastolta toiselle.\n\nLopullinen valikoima yhdistää kestävyyden rauhalliseen ilmeeseen. Säädöt ovat helposti ulottuvilla, pinnat käytännöllisiä ylläpitää ja jokainen tuote tukee hoitohenkilökunnan työskentelyasentoja.',
        'imageUrls', '[]'::jsonb,
        'imageAlt', '',
        'caption', '',
        'imagePosition', 'right'
      ),
      jsonb_build_object(
        'id', 'lasting-result',
        'type', 'image-text',
        'heading', 'Kestämään suunniteltu ratkaisu',
        'body', E'Valmiit tilat tuntuvat nyt yhtenäisiltä olematta yksitoikkoisia. Hoitotiimit voivat liikkua huoneiden välillä luontevasti, ja potilaita vastassa ovat helposti lähestyttävät ja tukevat kalusteet.\n\nEnnen kaikkea ratkaisu on valmis arjen todellisuuteen: jatkuvaan käyttöön, muuttuviin potilastarpeisiin ja modernin terveydenhuollon korkeisiin vaatimuksiin.',
        'imageUrls', jsonb_build_array('/images/chair1.png'),
        'imageAlt', 'Keskussairaalan hoitoympäristöön valittu potilastuoli',
        'caption', 'Huolella valittu potilastuoli tukee mukavuutta ja käytännöllistä päivittäistä hoitoa.',
        'imagePosition', 'right'
      )
    )
where locale = 'fi'
  and project_id = (select id from public.reference_projects where slug = 'central-hospital-care-environments');

notify pgrst, 'reload schema';
commit;

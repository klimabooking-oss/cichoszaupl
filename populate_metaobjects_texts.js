import { URLSearchParams } from 'node:url';

const SHOP = "8bf936-41";
const CLIENT_ID = "c541a99688b8fbe6bdf3c31d5c259f87";
const CLIENT_SECRET = "API_SECRET_REMOVED_FOR_SECURITY";

let token = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (token && Date.now() < tokenExpiresAt - 60_000) return token;

  const response = await fetch(
    `https://${SHOP}.myshopify.com/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    }
  );

  if (!response.ok) throw new Error(`Token request failed: ${response.status}`);
  const { access_token, expires_in } = await response.json();
  token = access_token;
  tokenExpiresAt = Date.now() + expires_in * 1000;
  return token;
}

// Add a slight delay function to avoid rate limits
const delay = ms => new Promise(res => setTimeout(res, ms));

async function graphql(query, variables = {}) {
  await delay(250); // Ratelimit protection (~4 req/sec)
  const response = await fetch(
    `https://${SHOP}.myshopify.com/admin/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': await getToken(),
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) throw new Error(`GraphQL request failed: ${response.status}`);
  const { data, errors } = await response.json();
  if (errors?.length) throw new Error(`GraphQL errors: ${JSON.stringify(errors)}`);
  return data;
}

const ALL_TYPES = [
  "strona_glowna",
  "oferta_wynajem",
  "cennik",
  "oferta_b2b",
  "oferta_kino_plenerowe",
  "oferta_konferencje",
  "oferta_teatr_silent",
  "oferta_eventy_firmowe",
  "oferta_festiwale",
  "oferta_beach_bary"
];

function getTextsForType(type, miasto) {
  let krotki_hook = "";
  let opis_sprzedazowy = "";
  let tekst_seo = "";
  let opcja_roi = "false";
  let opis_sprzedazowy_v2 = "";
  let tekst_seo_v2 = "";

  switch(type) {
    case 'strona_glowna':
      krotki_hook = `Wynajem sprzętu Silent Disco w mieście ${miasto}. Zorganizuj niezapomniany event bez ograniczeń hałasu.`;
      opis_sprzedazowy = `<p>Szukasz innowacyjnego rozwiązania na imprezę w mieście <strong>${miasto}</strong>? Cichoszau.pl to lider wynajmu słuchawek Silent Disco. Zapewniamy sprzęt, który rozwiązuje problem ciszy nocnej i różnorodnych gustów muzycznych. Idealne na imprezy firmowe, wesela i festiwale w regionie.</p>`;
      tekst_seo = `<p>Silent Disco ${miasto} to najczęściej wybierana atrakcja eventowa. Obsługujemy wynajem słuchawek w całym województwie, gwarantując zasięg 500 metrów, 10 godzin pracy na baterii i kryształowy dźwięk na 3 kanałach.</p>`;
      opcja_roi = "true";
      break;

    case 'oferta_wynajem':
      krotki_hook = `Niezawodny sprzęt Silent Disco na wynajem - ${miasto} i okolice.`;
      opis_sprzedazowy = `<p>Wypożyczalnia słuchawek Silent Disco obsługująca <strong>${miasto}</strong>. Oferujemy zdezynfekowane, naładowane i gotowe do akcji zestawy "Plug & Play". Nasz sprzęt pozwala na organizację perfekcyjnej domówki, poprawin czy imprezy plenerowej bez martwienia się o policję i sąsiadów.</p>`;
      tekst_seo = `<p>Wynajem słuchawek silent disco ${miasto} w najlepszych cenach. Otrzymujesz komplet okablowania, nadajniki dalekiego zasięgu i wsparcie techniczne. Nasza aplikacja CichoszauRent.pl chroni przed zagubieniem sprzętu.</p>`;
      opcja_roi = "false";
      break;

    case 'oferta_b2b':
    case 'oferta_eventy_firmowe':
      krotki_hook = `Integracje firmowe i eventy korporacyjne Silent Disco - ${miasto}.`;
      opis_sprzedazowy = `<p>Jako HR Manager w mieście <strong>${miasto}</strong> wiesz, jak trudno zorganizować udaną integrację. Silent Disco to koniec podziałów muzycznych i problemów z ciszą nocną w hotelach. Dostarczamy sprzęt, obsługę techniczną i dedykowanych DJ-ów, by zapewnić ROI z każdego eventu pracowniczego.</p>`;
      tekst_seo = `<p>Silent disco dla firm ${miasto}. Kompleksowa organizacja imprez firmowych, konferencji i targów z użyciem bezprzewodowych słuchawek wielokanałowych. Sprawdź nasz kalkulator B2B i ruszajmy z projektem!</p>`;
      opcja_roi = "true";
      break;

    case 'cennik':
      krotki_hook = `Transparentny cennik wynajmu Silent Disco w mieście ${miasto}.`;
      opis_sprzedazowy = `<p>Sprawdź aktualne ceny wynajmu sprzętu Silent Disco z dostawą do miasta <strong>${miasto}</strong>. Skonfiguruj swój zestaw w kalkulatorze i natychmiast poznaj całkowity koszt, włączając opcje transportu i dodatkowego nagłośnienia.</p>`;
      tekst_seo = `<p>Silent disco cena ${miasto}. Koszty wynajmu słuchawek, nadajników i obsługi dj-skiej. Przejrzyste pakiety cenowe dla klientów indywidualnych oraz biznesowych w Twoim regionie.</p>`;
      opcja_roi = "false";
      break;

    case 'oferta_kino_plenerowe':
      krotki_hook = `Słuchawki do Kina Plenerowego w mieście ${miasto}.`;
      opis_sprzedazowy = `<p>Zorganizuj niezapomniane kino plenerowe w mieście <strong>${miasto}</strong> bez uciążliwego hałasu dla mieszkańców. Zapewniamy kompletny zestaw słuchawek, dzięki którym seans odbędzie się w najwyższej jakości dźwięku, nawet w gęstej zabudowie miejskiej.</p>`;
      tekst_seo = `<p>Kino plenerowe wynajem słuchawek ${miasto}. Zapewniamy wielokanałowe ścieżki dźwiękowe (np. dla ścieżki i lektora zewnętrznego). Słuchawki odporne na warunki atmosferyczne i z gwarancją 10h pracy po zachodzie słońca.</p>`;
      opcja_roi = "false";
      break;

    case 'oferta_konferencje':
      krotki_hook = `Systemy słuchawkowe na konferencje i sympozja - ${miasto}.`;
      opis_sprzedazowy = `<p>Obsługa konferencji i tłumaczeń symultanicznych <strong>${miasto}</strong>. Nasz nowoczesny sprzęt na 3 kanałach to czysty przekaz bez zakłóceń dla setek uczestników sympozjum jednocześnie. Idealne rozwiązanie do trudnych akustycznie hal i dusznych sal konferencyjnych.</p>`;
      tekst_seo = `<p>Wynajem sprzętu konferencyjnego ${miasto}, słuchawki na konferencje, tłumaczenia symultaniczne. Precyzyjna komunikacja dla branży B2B oparta na niezawodnych nadajnikach Cichoszau.</p>`;
      opcja_roi = "true";
      break;
      
    case 'oferta_teatr_silent':
      krotki_hook = `Spektakle i sztuki w formule Silent Theatre - ${miasto}.`;
      opis_sprzedazowy = `<p>Wkrocz w immersyjny świat teatru w mieście <strong>${miasto}</strong>. Dostarczamy systemy audio dla nietypowych inicjatyw artystycznych. Dźwięk prosto do uszu widza to gwarancja emocji, intymności i pełnego skupienia.</p>`;
      tekst_seo = `<p>Silent theatre systemy audio ${miasto}. Zanurz widzów w spektaklu plenerowym lub kameralnym performansie dzięki doskonałemu odseparowaniu dźwięków otoczenia. 100% niezawodności.</p>`;
      opcja_roi = "false";
      break;

    case 'oferta_festiwale':
      krotki_hook = `Cicha strefa Silent Disco na Festiwalach w ${miasto}.`;
      opis_sprzedazowy = `<p>Rozbuduj swój festiwal w mieście <strong>${miasto}</strong> o uwielbianą przez uczestników strefę Silent Disco. Pracujemy z największymi markami w Polsce, odciążając organizatora w wydawaniu słuchawek i sterowaniu imprezą nocną.</p>`;
      tekst_seo = `<p>Silent Disco na festiwal ${miasto}, wynajem na masowe imprezy. Dostarczamy tysiące słuchawek w specjalnych skrzyniach i automatyzujemy zwroty przez naszą aplikację, eliminując straty na bramkach.</p>`;
      opcja_roi = "true";
      break;

    case 'oferta_beach_bary':
      krotki_hook = `Zorganizuj gorące Silent Disco w Beach Barze - ${miasto}.`;
      opis_sprzedazowy = `<p>Beach Bary w <strong>${miasto}</strong> często zmagają się z limitami decybeli i mandatami za hałas. Przejdź na model Cichej Imprezy - bar zarabia, goście tańczą na piasku do 3 różnych DJ-ów, a okoliczni mieszkańcy śpią spokojnie.</p>`;
      tekst_seo = `<p>Silent disco w beach barze ${miasto}, sposób na ciszę nocną na plażach miejskich. Wznieś imprezę na kolejny poziom, zabezpieczając się przed karami z wydziału środowiska.</p>`;
      opcja_roi = "true";
      break;
      
    default:
      // Fallback
      krotki_hook = `Silent Disco ${miasto}`;
      opis_sprzedazowy = `<p>Wynajem słuchawek w mieście <strong>${miasto}</strong>.</p>`;
      tekst_seo = `<p>Silent disco ${miasto}.</p>`;
  }

  return { krotki_hook, opis_sprzedazowy, tekst_seo, opcja_roi, opis_sprzedazowy_v2, tekst_seo_v2 };
}

async function main() {
  console.log("Fetching 'Miasto' entries...");
  const getCitiesQuery = `
    {
      metaobjects(type: "miasto", first: 250) {
        edges {
          node {
            handle
            fields {
              key
              value
            }
          }
        }
      }
    }
  `;
  const citiesData = await graphql(getCitiesQuery);
  const cities = citiesData.metaobjects.edges.map(e => {
    const nazwaField = e.node.fields.find(f => f.key === 'nazwa');
    return {
      handle: e.node.handle,
      nazwa: nazwaField ? nazwaField.value : null
    };
  }).filter(c => c.nazwa);
  
  console.log(`Found ${cities.length} cities.`);

  for (const defType of ALL_TYPES) {
    console.log(`\n======================================`);
    console.log(`Processing definition: ${defType}`);
    
    // Process each city for this definition
    let updatedCount = 0;
    
    // Fetch existing entries for safety to map handles, though handle is just lowercase name normally
    // but the format is type: handle. So handle obj is { "type": defType, "handle": city.handle }
    
    for (const city of cities) {
      const texts = getTextsForType(defType, city.nazwa);
      
      const updateMutation = `
        mutation metaobjectUpsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
          metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
            metaobject { handle }
            userErrors { field message }
          }
        }
      `;
      // Shopify requires string representations for boolean, and JSON strings for rich_text_field
      const richTextObjSp = { type: 'root', children: [{ type: 'paragraph', children: [{ type: 'text', value: texts.opis_sprzedazowy.replace(/<[^>]+>/g, '') }] }] }; // simple fallback if raw HTML is not accepted by rich_text, but actually shopify allows passing raw HTML to rich text or simple strings using specific formatting if we are careful, wait, rich_text_field requires JSON AST format string.
      // Wait, rich_text_field in Liquid can be accessed directly. If we send a json string or formatted text, but often sending HTML wrapped in a specific JSON structure is needed for Shopify rich text.
      // Let's use simple string since single_line and multi_line support strings.
      // Ah, opis_sprzedazowy is "rich_text_field" according to the schema.
      // A Shopify rich_text_field expects a stringified JSON representation of its AST.
      // Let's convert HTML to simple AST.
      
      const buildRichText = (htmlStr) => {
        // very basic HTML strip and parse since our templates only use <p> and <strong>
        // Actually, we can just inject a single text node inside a paragraph, but to support strong we need to parse it.
        // Let's simplify and just pass the HTML as text, or even better, build the AST since we control the template strictly.
        let stripped = htmlStr.replace(/<p>/g, '').replace(/<\/p>/g,'');
        let parts = stripped.split(/<strong>|<\/strong>/);
        let children = [];
        let isStrong = false;
        
        // if no tags, just 1 text child
        if(parts.length === 1) {
            children.push({ type: 'text', value: stripped });
        } else {
            for(let i=0; i<parts.length; i++) {
                if(parts[i]) {
                    children.push({ type: 'text', value: parts[i], bold: isStrong });
                }
                isStrong = !isStrong; // switch on every boundary (assumes tags are balanced)
            }
        }

        return JSON.stringify({
           type: 'root',
           children: [
             {
               type: 'paragraph',
               children: children
             }
           ]
        });
      };

      const vars = {
        handle: { type: defType, handle: city.handle },
        metaobject: {
          fields: [
            { key: "nazwa", value: city.nazwa },
            { key: "krotki_hook", value: texts.krotki_hook },
            { key: "opcja_roi", value: texts.opcja_roi },
            { key: "opis_sprzedazowy", value: buildRichText(texts.opis_sprzedazowy) },
            { key: "tekst_seo", value: buildRichText(texts.tekst_seo) },
            { key: "opis_sprzedazowy_v2", value: "" },
            { key: "tekst_seo_v2", value: "" }
          ]
        }
      };

      const res = await graphql(updateMutation, vars);
      if (res.metaobjectUpsert.userErrors.length > 0) {
        console.error(`Error updating ${defType} -> ${city.handle}:`, JSON.stringify(res.metaobjectUpsert.userErrors));
      } else {
        updatedCount++;
        process.stdout.write(`.` ); // progress indicator
      }
    }
    console.log(`\nUpdated ${updatedCount} entries for ${defType}.`);
  }
}

main().catch(e => console.error("FATAL ERROR", e));

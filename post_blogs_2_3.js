import { URLSearchParams } from 'node:url';

const SHOP = "8bf936-41";
const CLIENT_ID = "c541a99688b8fbe6bdf3c31d5c259f87";
const CLIENT_SECRET = "API_SECRET_REMOVED_FOR_SECURITY";
const BLOG_ID = "gid://shopify/Blog/124349776212"; // Strefa wiedzy Silent Disco

let token = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (token && Date.now() < tokenExpiresAt - 60_000) return token;
  const response = await fetch(`https://${SHOP}.myshopify.com/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  if (!response.ok) throw new Error(`Token request failed: ${response.status}`);
  const { access_token, expires_in } = await response.json();
  token = access_token;
  tokenExpiresAt = Date.now() + expires_in * 1000;
  return token;
}

async function graphql(query, variables = {}) {
  const response = await fetch(`https://${SHOP}.myshopify.com/admin/api/2025-01/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': await getToken(),
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new Error(`GraphQL request failed: ${response.status}`);
  const { data, errors } = await response.json();
  if (errors?.length) throw new Error(`GraphQL errors: ${JSON.stringify(errors)}`);
  return data;
}

const articles = [
  {
    title: "Dlaczego higiena słuchawek to podstawa sukcesu eventu?",
    body: `
      <p>Jako specjaliści zajmujący się wynajmem słuchawek na eventy każdego tygodnia, w Cichoszau doskonale wiemy, że w branży MICE (Meetings, Incentives, Conferences, and Exhibitions) pojęcie "jakość" dawno wyewoluowało poza sam sprzęt audio. Obecnie, obok niezawodności technologiczej o zasięgu do 500m i baterii na 10 godzin, najważniejszym filarem każdego profesjonalnego B2B eventu jest bezpieczeństwo i zdrowie uczestników.</p>
      
      <h2>Dezynfekcja słuchawek eventowych: Procedury E-E-A-T w praktyce</h2>
      <p>Decydując się na wynajem słuchawek silent disco na integrację lub konferencję, HR Managerowie słusznie zwracają uwagę na potencjalne zagrożenia sanitarne. Użyczany sprzęt zmienia wielokrotnie swoich właścicieli na przestrzeni miesiąca. Dlatego tanie opcje wynajmu, w których "dezynfekcja" polega jedynie na przetarciu sprzętu suchą szmatką, nie mają już racji bytu i stanowią naruszenie polityki BHP wielu korporacji.</p>
      <p>W Cichoszau wdrożyliśmy bezkompromisowy protokół bezpieczeństwa:</p>
      <ul>
        <li><strong>Naświetlanie promieniami UV-C:</strong> Każde urządzenie po zjechaniu z eventu jest poddawane sterylizacji światłem ultrafioletowym. Niszczy to 99.9% drobnoustrojów i bakterii ukrytych w nausznikach i pałąku.</li>
        <li><strong>Chemia bezpieczna dla skóry:</strong> Do ręcznego czyszczenia oprawek używamy specyfików na bazie alkoholu i nieuczulających składników ochronnych poświadczonych certyfikatami medycznymi.</li>
        <li><strong>Opcjonalne osłony jednorazowe:</strong> Na konferencje i spotkania VIP oferujemy jednorazowe nakładki higieniczne na gąbki.</li>
      </ul>

      <h2>Aplikacja CichoszauRent: Zero kolejek i kontrola</h2>
      <p>Higiena na evencie to także unikanie tłoku przy stanowiskach wydawania sprzętu. Nasz system <strong>CichoszauRent.pl</strong> zapobiega gromadzeniu się ludzi. Słuchawki cyfrowo łączą się z listą gości, co drastycznie skraca czas oczekiwania i umożliwia bezzwłoczną dystrybucję czystego, bezpiecznego sprzętu do poszczególnych użytkowników w ciągu sekund!</p>

      <h2>Odbierz Kalkulację z Gwarancją Higieny</h2>
      <p>Nie ryzykuj zdrowia swoich pracowników dla "tańszej" wypożyczalni, która nie przestrzega norm sanitatnych. Skonfiguruj swój idealny, certyfikowany sprzęt w 3 minuty i odbierz wycenę przez nasz interaktywny The B2B Calculator (wyżej na stronie).</p>
    `
  },
  {
    title: "Tradycyjne nagłośnienie vs. Silent Disco – podział kosztów",
    body: `
      <p>Planowanie budżetu na coroczną integrację firmową lub dużą konferencję często rodzi pytanie: czy naprawdę warto płacić za "tradycyjne głośniki"? Analiza z perspektywy naszego Senior Event Strategista obnaża koszty ukryte w klasycznym modelu imprez firmowych. <strong>Koszty eventu firmowego</strong> stają się znacznie bardziej przejrzyste, gdy z pomocą przychodzi elastyczna platforma Silent Disco.</p>

      <h2>Koszty ukryte tradycyjnego sprzętu</h2>
      <p>Wypożyczenie typowego setupu głośników PA z pozoru wygląda taniej, ale za "standardową kwotą wyjściową" najczęściej ukrywają się tzw. wydatki w cieniu, takie jak: wynajęcie stelaży, konieczność transportu wielkogabarytowego towaru dwoma vanami czy długotrwałe konfiguracje technika dźwiękowego. Dodatkowo w plenerze generuje to kary administracyjne lub wymusza uzyskanie pozwoleń akustycznych, by nie łamać ciszy nocnej po 22:00. Płacisz też za uciążliwy konflikt pokoleń - starsi goście uciekną do pokoi słysząc agresywną elektronikę do północy.</p>

      <h2>Silent Disco cena i ROI z technologii 3-kanałowej</h2>
      <p>Silent Disco oferuje model "wszystko wymyślone". Zamiast rezerwować trzy odmienne sale w hotelu żeby zaspokoić różne gusta personelu, łączysz całą firmę w jednym pomieszczeniu oferując do wyboru 3 osobne stacje muzyczne (nadajniki na pasmach RF do 500 metrów).</p>
      <ul>
        <li><strong>Wydatki na DJ'a vs Bitwa DJ-ów:</strong> Tradycyjnie wynajmujesz 1 osobę grającą hit. W Silent Disco możesz postawić 2 lub 3 osoby naprzeciwko siebie. "DJ na event firmowy" staje się więc integralnym aktorem widowiska, które podbija zadowolenie bez echa hałasu głuchego pogłosu z sali.</li>
        <li><strong>Plug & Play (Wymierna redukcja czasu):</strong> Komputer (nawet Twój telefon via minijack) podpinasz w 30 sekund bezpośrednio pod nadajnik, rozpakowujesz naładowane w 100% bateryjne słuchawki z walizki dezynfekcyjnej... i ruszasz.</li>
        <li><strong>Redukcja zaginionego sprzętu:</strong> Obsługa naszej aplikacji <em>CichoszauRent.pl</em> likwiduje koszt gubiących się przedmiotów podczas wydawki.</li>
      </ul>

      <h2>Czas na Twój Krok Edukowany</h2>
      <p>Inwestycja w nowoczesne B2B jest o ułamek procenta bardziej zoptymalizowana względem strat organizacyjnych. Chcesz to policzyć? Dodaj liczbę osób, lokalizację i datę w naszym <strong>The B2B Booking Calculator</strong> na tej stronie, aby uzyskać PDF ze specyfikacją netto i brutto od ręki!</p>
    `
  }
];

async function publishArticles() {
  const mutation = `
    mutation articleCreate($article: ArticleCreateInput!) {
      articleCreate(article: $article) {
        article {
          id
          title
          handle
        }
        userErrors {
          message
        }
      }
    }
  `;

  for (const articleInfo of articles) {
    const variables = {
      article: {
        blogId: BLOG_ID,
        title: articleInfo.title,
        body: articleInfo.body,
        author: { name: "Cichoszau" },
        isPublished: true
      }
    };

    try {
      const data = await graphql(mutation, variables);
      console.log(`Created: ${articleInfo.title}`, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error(`Failed to create ${articleInfo.title}:`, err.message);
    }
  }
}

publishArticles().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

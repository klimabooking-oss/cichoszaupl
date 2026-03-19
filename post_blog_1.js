import { URLSearchParams } from 'node:url';

const SHOP = "8bf936-41";
const CLIENT_ID = "c541a99688b8fbe6bdf3c31d5c259f87";
const CLIENT_SECRET = "API_SECRET_REMOVED_FOR_SECURITY";

// The "Strefa wiedzy Silent Disco" blog ID we found
const BLOG_ID = "gid://shopify/Blog/124349776212";

if (!SHOP || !CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Set SHOPIFY_SHOP, SHOPIFY_CLIENT_ID, and SHOPIFY_CLIENT_SECRET.');
}

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

async function graphql(query, variables = {}) {
  const response = await fetch(
    `https://${SHOP}.myshopify.com/admin/api/2025-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': await getToken(),
      },
      body: JSON.stringify({ query, variables }),
    }
  );

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.status}`);
  }

  const { data, errors } = await response.json();
  if (errors?.length) {
    throw new Error(`GraphQL errors: ${JSON.stringify(errors)}`);
  }
  return data;
}

const articleContentHtml = `
<p>Z mojego doświadczenia jako Senior Event Strategist w Cichoszau.pl wynika, że największym koszmarem każdego HR Managera jest przerwana impreza integracyjna z powodu interwencji o ciszę nocną. Tradycyjne nagłośnienie w obiektach hotelowych i miejskich restauracjach często napotyka na twarde bariery decybeli po godzinie 22:00, co oznacza przedwczesny koniec zabawy i zmarnowany budżet.</p>

<h2>Rozwiązanie: Integracja bez hałasu na 3 kanałach muzycznych</h2>
<p>Dzięki technologii <strong>Silent Disco</strong> możemy zorganizować spektakularną imprezę bez ryzyka złamania ciszy nocnej. Co więcej, rozwiązuje to problem różnych gustów muzycznych w firmie. Wyobraź sobie "bitwę DJ-ów" na żywo – fani rocka, muzyki elektronicznej i najnowszych hitów bawią się jednocześnie na jednym parkiecie! Każdy tańczy do tego, co lubi, co eliminuje nudę i angażuje wszystkie grupy wiekowe. Z naszego rozwiązania sukcesywnie korzystają liderzy rynku, budując zadowolenie wśród pracowników i partnerów takich marek jak PepsiCo.</p>

<h2>Przewaga technologiczna i operacyjna: Kompletne De-risking</h2>
<p>W Cichoszau.pl rozumiemy, że organizacja eventu firmowego to ogromna logistyka. Dlatego zdejmujemy z Twoich barków problemy techniczne, opierając się na sprzęcie i procesach najwyższej klasy (standard E-E-A-T):</p>
<ul>
<li><strong>10 godzin pracy na baterii:</strong> Nasze słuchawki eventowe przyjeżdżają do Ciebie w pełni naładowane w sterylnych skrzyniach, co stanowi 100% gwarancji ciągłości zabawy do białego rana.</li>
<li><strong>Zasięg 500 metrów:</strong> Imponujący nadajnik RF (Radio Frequency) pozwala uczestnikom przemieszczać się wewnątrz dużych obiektów, sal konferencyjnych oraz w przylegających ogrodach bez straty jakości sygnału.</li>
<li><strong>Autorska aplikacja CichoszauRent.pl:</strong> Koniec z chaosem i kolejkami! Nasz innowacyjny system cyfrowy przypisuje słuchawki bezpośrednio do Twoich gości. To skraca czas wydawania i redukuje ryzyko zagubienia sprzętu o 95%.</li>
<li><strong>Rygorystyczna higiena:</strong> Jako eksperci branży wiemy, jak ważna jest czystość. Po każdym wynajmie wdrażamy szczegółowy protokół dezynfekcji oraz stosujemy lampy UV-C. Opcjonalnie udostępniamy sterylne, jednorazowe osłonki naścienne.</li>
</ul>

<h2>Skorzystaj z Kalkulatora i odbierz Ofertę automatycznie</h2>
<p>W 2026 roku event design to nie tylko zabawa, ale i optymalizacja czasu pracy. Nie czekaj godzinami na odpowiedź e-mailową od handlowca. <strong>Skorzystaj z naszego inteligentnego The B2B Calculator na stronie głównej, wybierz datę, lokalizację oraz wielkość zespołu i wygeneruj spersonalizowaną ofertę PDF w 30 sekund!</strong></p>
`;

async function publishArticle() {
  const mutation = `
    mutation articleCreate($article: ArticleCreateInput!) {
      articleCreate(article: $article) {
        article {
          id
          title
          handle
          publishedAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    article: {
      blogId: BLOG_ID,
      title: "Jak Silent Disco ratuje imprezę firmową przy restrykcjach hałasu?",
      body: articleContentHtml,
      author: {
        name: "Cichoszau"
      },
      isPublished: true
    }
  };

  try {
    const data = await graphql(mutation, variables);
    console.log('Article Created:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to create article:', err.message);
  }
}

publishArticle().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

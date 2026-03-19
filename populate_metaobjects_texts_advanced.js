import { URLSearchParams } from 'node:url';
import { generateVariants } from './ai_spintax_generator.js';

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
  "oferta_kino_plenerowe",
  "oferta_konferencje",
  "oferta_teatr_silent",
  "oferta_festiwale",
  "oferta_beach_bary"
];

// Helper to construct Shopify AST from simple HTML-like text
const buildRichText = (htmlStr) => {
    let stripped = htmlStr.replace(/<p>/g, '').replace(/<\/p>/g,'').replace(/<em>/g, '').replace(/<\/em>/g, '');
    let parts = stripped.split(/<strong>|<\/strong>/);
    let children = [];
    let isStrong = false;
    
    if(parts.length === 1) {
        children.push({ type: 'text', value: stripped });
    } else {
        for(let i=0; i<parts.length; i++) {
            if(parts[i]) {
                const node = { type: 'text', value: parts[i] };
                if (isStrong) node.bold = true;
                children.push(node);
            }
            isStrong = !isStrong;
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
    
    let updatedCount = 0;
    
    for (const city of cities) {
      // Use our new AI spintax generator
      const texts = generateVariants(city.nazwa, defType);
      
      const updateMutation = `
        mutation metaobjectUpsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
          metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
            metaobject { handle }
            userErrors { field message }
          }
        }
      `;

      const vars = {
        handle: { type: defType, handle: city.handle },
        metaobject: {
          fields: [
            { key: "nazwa", value: city.nazwa },
            { key: "krotki_hook", value: texts.hook },
            { key: "opcja_roi", value: texts.roi },
            { key: "opis_sprzedazowy", value: buildRichText(texts.sales) },
            { key: "tekst_seo", value: buildRichText(texts.seo) },
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
        process.stdout.write(`.`);
      }
    }
    console.log(`\nUpdated ${updatedCount} entries for ${defType}.`);
  }
  
  console.log("\n✅ All definitions populated with AI-generated spintax content!");
}

main().catch(e => console.error("FATAL ERROR", e));

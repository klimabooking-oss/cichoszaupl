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

async function graphql(query, variables = {}) {
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

const MISSING_DEFS = [
  { type: "strona_glowna", name: "Strona Główna" },
  { type: "oferta_wynajem", name: "Oferta Wynajem" },
  { type: "cennik", name: "Cennik" },
  { type: "oferta_b2b", name: "Oferta B2B" }
];

const FIELDS = [
  { name: "Nazwa", key: "nazwa", type: "single_line_text_field" },
  { name: "Krótki Hook", key: "krotki_hook", type: "multi_line_text_field" },
  { name: "Opcja ROI", key: "opcja_roi", type: "boolean" },
  { name: "Opis Sprzedażowy", key: "opis_sprzedazowy", type: "rich_text_field" },
  { name: "Tekst SEO", key: "tekst_seo", type: "rich_text_field" },
  { name: "Opis Sprzedażowy v2", key: "opis_sprzedazowy_v2", type: "multi_line_text_field" },
  { name: "Tekst SEO v2", key: "tekst_seo_v2", type: "multi_line_text_field" }
];

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

  for (const def of MISSING_DEFS) {
    console.log(`\nProcessing definition: ${def.type}`);
    
    // Check if definition exists
    const checkDefQuery = `
      query {
        metaobjectDefinitionByType(type: "${def.type}") {
          id
        }
      }
    `;
    const checkDefData = await graphql(checkDefQuery);
    
    let defId = null;

    if (!checkDefData.metaobjectDefinitionByType) {
      console.log(`Definition ${def.type} not found. Creating...`);
      const createDefMutation = `
        mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
          metaobjectDefinitionCreate(definition: $definition) {
            metaobjectDefinition { id }
            userErrors { field message }
          }
        }
      `;
      const defVars = {
        definition: {
          name: def.name,
          type: def.type,
          access: { storefront: "PUBLIC_READ" },
          capabilities: { publishable: { enabled: true } },
          fieldDefinitions: FIELDS
        }
      };
      const crDef = await graphql(createDefMutation, defVars);
      if (crDef.metaobjectDefinitionCreate.userErrors.length > 0) {
        console.error("Errors creating def:", JSON.stringify(crDef.metaobjectDefinitionCreate.userErrors));
        continue;
      }
      defId = crDef.metaobjectDefinitionCreate.metaobjectDefinition.id;
      console.log(`Created definition ${def.type}.`);
    } else {
      console.log(`Definition ${def.type} already exists. Updating it just in case...`);
      defId = checkDefData.metaobjectDefinitionByType.id;
      // Let's make sure it has the capabilities
      const updateDefMutation = `
        mutation metaobjectDefinitionUpdate($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
          metaobjectDefinitionUpdate(id: $id, definition: $definition) {
            metaobjectDefinition { id }
            userErrors { field message }
          }
        }
      `;
      const updVars = {
        id: defId,
        definition: {
          capabilities: { publishable: { enabled: true } }
        }
      };
      const updDef = await graphql(updateDefMutation, updVars);
      if (updDef.metaobjectDefinitionUpdate.userErrors.length > 0) {
        console.error("Errors updating def:", JSON.stringify(updDef.metaobjectDefinitionUpdate.userErrors));
      }
    }

    // Now populate cities
    let currentObjects = [];
    let hasNextPage = true;
    let cursor = null;
    
    console.log(`Fetching existing entries for ${def.type}...`);
    while (hasNextPage) {
      const getObjsQuery = `
        query($cursor: String) {
          metaobjects(type: "${def.type}", first: 250, after: $cursor) {
            pageInfo { hasNextPage endCursor }
            edges { node { handle } }
          }
        }
      `;
      const objsData = await graphql(getObjsQuery, cursor ? { cursor } : {});
      if (objsData.metaobjects) {
         currentObjects.push(...objsData.metaobjects.edges.map(e => e.node.handle));
         hasNextPage = objsData.metaobjects.pageInfo.hasNextPage;
         cursor = objsData.metaobjects.pageInfo.endCursor;
      } else {
         hasNextPage = false;
      }
    }

    let createdCount = 0;
    for (const city of cities) {
      if (!currentObjects.includes(city.handle)) {
        const createObjMutation = `
          mutation metaobjectUpsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
            metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
              metaobject { id handle }
              userErrors { field message }
            }
          }
        `;
        const objVars = {
          handle: { type: def.type, handle: city.handle },
          metaobject: {
            capabilities: {
              publishable: { status: "ACTIVE" }
            },
            fields: [
              { key: "nazwa", value: city.nazwa }
            ]
          }
        };
        const crObj = await graphql(createObjMutation, objVars);
        if (crObj.metaobjectUpsert.userErrors.length > 0) {
          console.error(`Error creating ${city.handle}:`, JSON.stringify(crObj.metaobjectUpsert.userErrors));
        } else {
          createdCount++;
        }
      }
    }
    console.log(`Created ${createdCount} new entries for ${def.type}.`);
  }
}

main().catch(e => console.error("FATAL ERROR", e));

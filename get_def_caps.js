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
  const { data } = await response.json();
  return data;
}

async function main() {
  const query = `
    {
      metaobjectDefinitionByType(type: "oferta_festiwale") {
        id
        name
        capabilities {
          publishable { enabled }
        }
      }
    }
  `;
  console.log(JSON.stringify(await graphql(query), null, 2));
}

main().catch(console.error);

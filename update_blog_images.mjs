import fs from 'node:fs/promises';
import { URLSearchParams } from 'node:url';

const SHOP = process.env.SHOPIFY_SHOP;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;

if (!SHOP || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing SHOPIFY credentials in env.');
  process.exit(1);
}

const images = {
    "Dlaczego higiena słuchawek to podstawa sukcesu eventu?": {
        path: "/Users/mateuszswiderski/.gemini/antigravity/brain/24014c4c-a211-46cb-80f0-03e92bf9f5bd/blog_hygiene_uv_1773539262086.png",
        alt: "Dezynfekcja słuchawek Silent Disco UV w skrzyni"
    },
    "Tradycyjne nagłośnienie vs. Silent Disco – podział kosztów": {
        path: "/Users/mateuszswiderski/.gemini/antigravity/brain/24014c4c-a211-46cb-80f0-03e92bf9f5bd/blog_costs_roi_1773539278486.png",
        alt: "Porównanie kosztów Tradycyjne PA vs Silent Disco ROI"
    }
};

let token = null;

async function getToken() {
  if (token) return token;

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

  const data = await response.json();
  token = data.access_token;
  return token;
}

async function requestREST(endpoint, method = 'GET', body = null) {
  const t = await getToken();
  const url = `https://${SHOP}.myshopify.com/admin/api/2024-01/${endpoint}`;
  const options = {
      method,
      headers: {
          'X-Shopify-Access-Token': t,
          'Content-Type': 'application/json'
      }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`REST Error ${res.status}: ${text}`);
  }
  return await res.json();
}

async function requestGraphQL(query, variables = {}) {
  const t = await getToken();
  const response = await fetch(
    `https://${SHOP}.myshopify.com/admin/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': t,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  if (!response.ok) throw new Error(`GraphQL failed: ${response.status}`);
  const json = await response.json();
  if (json.errors) {
      console.error(JSON.stringify(json.errors, null, 2));
      throw new Error('GraphQL Errors');
  }
  return json.data;
}

async function main() {
  console.log('Fetching blogs...');
  const blogsData = await requestREST('blogs.json');
  
  if (!blogsData.blogs || blogsData.blogs.length === 0) {
      console.error('No blogs found on this store.');
      return;
  }
  
  for (const blog of blogsData.blogs) {
      console.log(`\nChecking blog: ${blog.title} (ID: ${blog.id})`);
      const articlesData = await requestREST(`blogs/${blog.id}/articles.json?limit=250`);
      const articles = articlesData.articles;

      for (const article of articles) {
          let matchKey = null;
          if (article.title.includes("higiena") || article.title.includes("Higiena")) {
              matchKey = "Dlaczego higiena słuchawek to podstawa sukcesu eventu?";
          } else if (article.title.includes("Koszty") || article.title.includes("kosztów") || article.title.includes("Tradycyjne") || article.title.includes("emocji")) {
              matchKey = "Tradycyjne nagłośnienie vs. Silent Disco – podział kosztów";
          }

          if (matchKey && images[matchKey]) {
              console.log(`Matched article: ${article.title} to key ${matchKey}`);
              
              try {
                  const imgData = images[matchKey];
                  const fileBuffer = await fs.readFile(imgData.path);
                  const base64Str = fileBuffer.toString('base64');
                  
                  console.log(`Uploading image for ${article.title}...`);
                  
                  const updateBody = {
                      article: {
                          id: article.id,
                          image: {
                              attachment: base64Str,
                              alt: imgData.alt
                          }
                      }
                  };
                  
                  await requestREST(`blogs/${blog.id}/articles/${article.id}.json`, 'PUT', updateBody);
                  console.log(`SUCCESS: Image updated for ${article.title}`);
              } catch(e) {
                  console.error(`Error processing ${article.title}:`, e);
              }
          }
      }
  }

  console.log('\nDone mapping images.');
}

main().catch(console.error);

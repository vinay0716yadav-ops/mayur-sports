import fs from 'fs';
import path from 'path';
import { Product, StoreInfo } from './types';
import { initialProducts, initialStoreInfo } from './seedData';

// Global variable across hot-reloads and lambda invocations
declare global {
  var __mayur_sports_products: Product[] | undefined;
  var __mayur_sports_store_info: StoreInfo | undefined;
  var __mayur_products_sha: string | undefined;
  var __mayur_store_sha: string | undefined;
  var __mayur_last_fetch: number | undefined;
}

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'mayur_products.json');
const STORE_FILE = path.join(DATA_DIR, 'mayur_store.json');

const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_PRODUCTS_FILE = path.join(LOCAL_DATA_DIR, 'products.json');
const LOCAL_STORE_FILE = path.join(LOCAL_DATA_DIR, 'store.json');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'vinay0716yadav-ops/mayur-sports';

// GitHub Sync Helper
async function fetchFromGitHub(filePath: string): Promise<{ data: any; sha: string } | null> {
  if (!GITHUB_TOKEN) return null;
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=main`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Mayur-Sports-App',
        'Accept': 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (json.content) {
      const decoded = Buffer.from(json.content, 'base64').toString('utf-8');
      return { data: JSON.parse(decoded), sha: json.sha };
    }
  } catch (err) {
    console.error(`GitHub fetch error for ${filePath}:`, err);
  }
  return null;
}

async function saveToGitHub(filePath: string, content: any, message: string): Promise<boolean> {
  if (!GITHUB_TOKEN) return false;
  try {
    // 1. Get latest SHA
    const checkRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=main`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Mayur-Sports-App',
        'Accept': 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    });

    let sha: string | undefined;
    if (checkRes.ok) {
      const info = await checkRes.json();
      sha = info.sha;
    }

    // 2. Put updated content
    const base64Content = Buffer.from(JSON.stringify(content, null, 2), 'utf-8').toString('base64');
    const putRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Mayur-Sports-App',
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        sha,
        branch: 'main',
      }),
    });

    if (putRes.ok) {
      const putData = await putRes.json();
      if (filePath.includes('products')) {
        global.__mayur_products_sha = putData.content?.sha;
      } else {
        global.__mayur_store_sha = putData.content?.sha;
      }
      return true;
    } else {
      const errText = await putRes.text();
      console.error(`GitHub commit failed for ${filePath}:`, errText);
    }
  } catch (err) {
    console.error(`GitHub save error for ${filePath}:`, err);
  }
  return false;
}

function ensureLocalFiles() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PRODUCTS_FILE)) {
      if (fs.existsSync(LOCAL_PRODUCTS_FILE)) {
        fs.writeFileSync(PRODUCTS_FILE, fs.readFileSync(LOCAL_PRODUCTS_FILE, 'utf-8'));
      } else {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2));
      }
    }
    if (!fs.existsSync(STORE_FILE)) {
      if (fs.existsSync(LOCAL_STORE_FILE)) {
        fs.writeFileSync(STORE_FILE, fs.readFileSync(LOCAL_STORE_FILE, 'utf-8'));
      } else {
        fs.writeFileSync(STORE_FILE, JSON.stringify(initialStoreInfo, null, 2));
      }
    }
  } catch (e) {}
}

async function loadProductsAsync(): Promise<Product[]> {
  const now = Date.now();
  // If memory cache exists and was fetched less than 30s ago, return it immediately
  if (global.__mayur_sports_products && global.__mayur_last_fetch && now - global.__mayur_last_fetch < 30000) {
    return global.__mayur_sports_products;
  }

  // 1. Try to fetch fresh data from GitHub repository
  if (GITHUB_TOKEN) {
    const ghRes = await fetchFromGitHub('data/products.json');
    if (ghRes && Array.isArray(ghRes.data) && ghRes.data.length > 0) {
      global.__mayur_sports_products = ghRes.data;
      global.__mayur_products_sha = ghRes.sha;
      global.__mayur_last_fetch = now;
      // Also cache to local file
      try {
        ensureLocalFiles();
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(ghRes.data, null, 2));
      } catch (e) {}
      return ghRes.data;
    }
  }

  // 2. Return memory cache if available
  if (global.__mayur_sports_products && global.__mayur_sports_products.length > 0) {
    return global.__mayur_sports_products;
  }

  // 3. Fallback to file system
  ensureLocalFiles();
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
      if (Array.isArray(parsed) && parsed.length > 0) {
        global.__mayur_sports_products = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  try {
    if (fs.existsSync(LOCAL_PRODUCTS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LOCAL_PRODUCTS_FILE, 'utf-8'));
      if (Array.isArray(parsed) && parsed.length > 0) {
        global.__mayur_sports_products = parsed;
        return parsed;
      }
    }
  } catch (e) {}

  global.__mayur_sports_products = [...initialProducts];
  return global.__mayur_sports_products;
}

async function saveProductsAsync(products: Product[]): Promise<void> {
  global.__mayur_sports_products = products;
  global.__mayur_last_fetch = Date.now();

  // 1. Write locally
  try {
    ensureLocalFiles();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    if (!isVercel && fs.existsSync(LOCAL_DATA_DIR)) {
      fs.writeFileSync(LOCAL_PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    }
  } catch (e) {}

  // 2. Commit permanently to GitHub repository
  if (GITHUB_TOKEN) {
    await saveToGitHub('data/products.json', products, 'Update product catalog via Mayur Sports Admin');
  }
}

async function loadStoreInfoAsync(): Promise<StoreInfo> {
  if (GITHUB_TOKEN) {
    const ghRes = await fetchFromGitHub('data/store.json');
    if (ghRes && ghRes.data && ghRes.data.name) {
      global.__mayur_sports_store_info = ghRes.data;
      global.__mayur_store_sha = ghRes.sha;
      return ghRes.data;
    }
  }

  if (global.__mayur_sports_store_info) {
    return global.__mayur_sports_store_info;
  }

  ensureLocalFiles();
  try {
    if (fs.existsSync(STORE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
      global.__mayur_sports_store_info = parsed;
      return parsed;
    }
  } catch (e) {}

  try {
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(LOCAL_STORE_FILE, 'utf-8'));
      global.__mayur_sports_store_info = parsed;
      return parsed;
    }
  } catch (e) {}

  global.__mayur_sports_store_info = { ...initialStoreInfo };
  return global.__mayur_sports_store_info;
}

async function saveStoreInfoAsync(info: StoreInfo): Promise<void> {
  global.__mayur_sports_store_info = info;

  try {
    ensureLocalFiles();
    fs.writeFileSync(STORE_FILE, JSON.stringify(info, null, 2), 'utf-8');
    if (!isVercel && fs.existsSync(LOCAL_DATA_DIR)) {
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(info, null, 2), 'utf-8');
    }
  } catch (e) {}

  if (GITHUB_TOKEN) {
    await saveToGitHub('data/store.json', info, 'Update store information via Mayur Sports Admin');
  }
}

export const db = {
  getProducts: async (): Promise<Product[]> => {
    return loadProductsAsync();
  },

  getProductById: async (id: string): Promise<Product | null> => {
    const products = await loadProductsAsync();
    return products.find(p => p.id === id) || null;
  },

  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const products = await loadProductsAsync();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newProduct, ...products];
    await saveProductsAsync(updated);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    const products = await loadProductsAsync();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;
    await saveProductsAsync(products);
    return updatedProduct;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    const products = await loadProductsAsync();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;

    await saveProductsAsync(filtered);
    return true;
  },

  getStoreInfo: async (): Promise<StoreInfo> => {
    return loadStoreInfoAsync();
  },

  updateStoreInfo: async (updates: Partial<StoreInfo>): Promise<StoreInfo> => {
    const current = await loadStoreInfoAsync();
    const updated = { ...current, ...updates };
    await saveStoreInfoAsync(updated);
    return updated;
  },
};

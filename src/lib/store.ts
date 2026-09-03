import fs from 'fs';
import path from 'path';
import { Product, StoreInfo } from './types';
import { initialProducts, initialStoreInfo } from './seedData';

// Global variable across hot-reloads in Next.js dev server
declare global {
  var __mayur_sports_products: Product[] | undefined;
  var __mayur_sports_store_info: StoreInfo | undefined;
}

// In Vercel serverless functions, the root is read-only. Use /tmp which is writable.
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'mayur_products.json');
const STORE_FILE = path.join(DATA_DIR, 'mayur_store.json');

// Local fallback file path when running locally
const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_PRODUCTS_FILE = path.join(LOCAL_DATA_DIR, 'products.json');
const LOCAL_STORE_FILE = path.join(LOCAL_DATA_DIR, 'store.json');

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PRODUCTS_FILE)) {
      // First try to copy from local data if exists
      if (fs.existsSync(LOCAL_PRODUCTS_FILE)) {
        const content = fs.readFileSync(LOCAL_PRODUCTS_FILE, 'utf-8');
        fs.writeFileSync(PRODUCTS_FILE, content, 'utf-8');
      } else {
        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2), 'utf-8');
      }
    }
    if (!fs.existsSync(STORE_FILE)) {
      if (fs.existsSync(LOCAL_STORE_FILE)) {
        const content = fs.readFileSync(LOCAL_STORE_FILE, 'utf-8');
        fs.writeFileSync(STORE_FILE, content, 'utf-8');
      } else {
        fs.writeFileSync(STORE_FILE, JSON.stringify(initialStoreInfo, null, 2), 'utf-8');
      }
    }
  } catch (err) {
    console.error('Storage ensureDataFile warning:', err);
  }
}

function loadProducts(): Product[] {
  if (global.__mayur_sports_products && global.__mayur_sports_products.length > 0) {
    return global.__mayur_sports_products;
  }

  ensureDataFile();

  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const raw = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        global.__mayur_sports_products = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading products from file:', err);
  }

  // Fallback to local data file if running locally
  try {
    if (fs.existsSync(LOCAL_PRODUCTS_FILE)) {
      const raw = fs.readFileSync(LOCAL_PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        global.__mayur_sports_products = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading local seed file:', err);
  }

  global.__mayur_sports_products = [...initialProducts];
  return global.__mayur_sports_products;
}

function saveProducts(products: Product[]): void {
  global.__mayur_sports_products = products;
  try {
    ensureDataFile();
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    // Also update local file if running in local environment
    if (!isVercel && fs.existsSync(LOCAL_DATA_DIR)) {
      fs.writeFileSync(LOCAL_PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error saving products:', err);
  }
}

function loadStoreInfo(): StoreInfo {
  if (global.__mayur_sports_store_info) {
    return global.__mayur_sports_store_info;
  }

  ensureDataFile();

  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      global.__mayur_sports_store_info = parsed;
      return parsed;
    }
  } catch {}

  try {
    if (fs.existsSync(LOCAL_STORE_FILE)) {
      const raw = fs.readFileSync(LOCAL_STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      global.__mayur_sports_store_info = parsed;
      return parsed;
    }
  } catch {}

  global.__mayur_sports_store_info = { ...initialStoreInfo };
  return global.__mayur_sports_store_info;
}

function saveStoreInfo(info: StoreInfo): void {
  global.__mayur_sports_store_info = info;
  try {
    ensureDataFile();
    fs.writeFileSync(STORE_FILE, JSON.stringify(info, null, 2), 'utf-8');
    if (!isVercel && fs.existsSync(LOCAL_DATA_DIR)) {
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(info, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error saving store info:', err);
  }
}

export const db = {
  getProducts: async (): Promise<Product[]> => {
    return loadProducts();
  },

  getProductById: async (id: string): Promise<Product | null> => {
    const products = loadProducts();
    return products.find(p => p.id === id) || null;
  },

  createProduct: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const products = loadProducts();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newProduct, ...products];
    saveProducts(updated);
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product | null> => {
    const products = loadProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;
    saveProducts(products);
    return updatedProduct;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    const products = loadProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;

    saveProducts(filtered);
    return true;
  },

  getStoreInfo: async (): Promise<StoreInfo> => {
    return loadStoreInfo();
  },

  updateStoreInfo: async (updates: Partial<StoreInfo>): Promise<StoreInfo> => {
    const current = loadStoreInfo();
    const updated = { ...current, ...updates };
    saveStoreInfo(updated);
    return updated;
  },
};

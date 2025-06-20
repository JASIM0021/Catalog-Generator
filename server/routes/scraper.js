import express from 'express';
import puppeteer from 'puppeteer';
import Joi from 'joi';
import logger from '../utils/logger.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

const scrapeSchema = Joi.object({
  url: Joi.string().uri().required()
});

// Helper for navigation with retry and better error logging
async function navigateWithRetry(page, url, options, retries = 3) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      logger.info(`Attempt ${attempt + 1} of ${retries + 1}: Trying to navigate to ${url}`);
      await page.goto(url, options);
      logger.info('Navigation successful');
      return;
    } catch (err) {
      lastError = err;
      logger.error(`Attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt < retries) {
        logger.info('Retrying in 2 seconds...');
        await new Promise(r => setTimeout(r, 2000)); // wait before retry
      }
    }
  }
  throw lastError;
}

// Scrape product information from URL
router.post('/scrape', validateRequest(scrapeSchema), async (req, res) => {
  const { url } = req.body;
  let browser = null;

  try {
    logger.info(`Starting scrape for URL: ${url}`);

    // Launch Puppeteer browser instance
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();

    // Set user agent and additional headers to avoid bot detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://google.com'
    });

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Improved navigation with retry and longer timeout
    try {
      await navigateWithRetry(page, url, {
        waitUntil: 'networkidle2',
        timeout: 60000 // 60 seconds for slow-loading pages
      }, 3); // 3 retries
    } catch (navError) {
      logger.error(`Navigation error for URL ${url}:`, navError);
      return res.status(500).json({
        success: false,
        error: 'Failed to load the page. The site may be down or blocking bots.',
        message: navError.message
      });
    }

    // Extract product information
    const productData = await page.evaluate(() => {
      const titleSelectors = [
        'h1[data-testid="product-title"]',
        'h1.product-title',
        'h1#product-title',
        '.product-name h1',
        '.product-title',
        'h1',
        '.title h1',
        '[data-cy="product-title"]'
      ];

      const descriptionSelectors = [
        '.product-description',
        '.product-details',
        '[data-testid="product-description"]',
        '.description',
        '.product-info',
        '.product-summary',
        'p'
      ];

      const priceSelectors = [
        '.price',
        '.product-price',
        '[data-testid="price"]',
        '.current-price',
        '.sale-price',
        '.price-current'
      ];

      const imageSelectors = [
        '.product-images img',
        '.product-gallery img',
        '.product-photos img',
        '[data-testid="product-image"]',
        '.main-image img',
        '.hero-image img'
      ];

      const getTextFromSelectors = (selectors) => {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            return element.textContent?.trim() || element.innerText?.trim();
          }
        }
        return null;
      };

      const getImagesFromSelectors = (selectors) => {
        const images = [];
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector);
          elements.forEach(img => {
            if (img.src && !img.src.includes('data:image')) {
              images.push({
                url: img.src,
                alt: img.alt || 'Product image'
              });
            }
          });
          if (images.length > 0) break;
        }
        return images.slice(0, 10); // Limit to 10 images
      };

      const extractSpecifications = () => {
        const specs = {};
        const specTables = document.querySelectorAll('table, .specifications, .product-specs, .spec-table');
        
        specTables.forEach(table => {
          const rows = table.querySelectorAll('tr, .spec-row, .specification-item');
          rows.forEach(row => {
            const cells = row.querySelectorAll('td, th, .spec-name, .spec-value, dt, dd');
            if (cells.length >= 2) {
              const key = cells[0].textContent?.trim();
              const value = cells[1].textContent?.trim();
              if (key && value && key.length < 50 && value.length < 200) {
                specs[key] = value;
              }
            }
          });
        });

        const specLists = document.querySelectorAll('.specs ul, .specifications ul, .product-details ul');
        specLists.forEach(list => {
          const items = list.querySelectorAll('li');
          items.forEach(item => {
            const text = item.textContent?.trim();
            if (text && text.includes(':')) {
              const [key, ...valueParts] = text.split(':');
              const value = valueParts.join(':').trim();
              if (key && value && key.length < 50 && value.length < 200) {
                specs[key.trim()] = value;
              }
            }
          });
        });

        return specs;
      };

      return {
        title: getTextFromSelectors(titleSelectors),
        description: getTextFromSelectors(descriptionSelectors),
        price: getTextFromSelectors(priceSelectors),
        specifications: extractSpecifications(),
        images: getImagesFromSelectors(imageSelectors),
        url: window.location.href
      };
    });

    // Clean and validate the extracted data
    const cleanedData = {
      title: productData.title || 'Product Title',
      description: productData.description || 'Product description not available',
      price: productData.price || null,
      specifications: productData.specifications || {},
      images: productData.images || [],
      url: productData.url,
      scrapedAt: new Date().toISOString()
    };

    logger.info(`Successfully scraped product: ${cleanedData.title}`);

    res.json({
      success: true,
      data: cleanedData
    });

  } catch (error) {
    logger.error(`Scraping error for URL ${url}:`, error);

    res.status(500).json({
      success: false,
      error: 'Failed to scrape product information',
      message: error.message
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

export default router;

import express from 'express';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Joi from 'joi';
import logger from '../utils/logger.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exportSchema = Joi.object({
  catalogData: Joi.object({
    product: Joi.object().required(),
    generatedContent: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      specifications: Joi.object().required(),
      features: Joi.array().items(Joi.string()).required(),
      benefits: Joi.array().items(Joi.string()).required()
    }).required(),
    layout: Joi.object({
      theme: Joi.string().required(),
      colorScheme: Joi.string().required(),
      typography: Joi.string().required()
    }).required(),
    images: Joi.array().items(Joi.object()).required()
  }).required(),
  format: Joi.string().valid('pdf', 'docx').required(),
  quality: Joi.string().valid('standard', 'high', 'print').default('high'),
  options: Joi.object({
    includeImages: Joi.boolean().default(true),
    includeSpecs: Joi.boolean().default(true),
    includeFeatures: Joi.boolean().default(true),
    includeBenefits: Joi.boolean().default(true)
  }).default({})
});

// Export catalog as PDF
router.post('/pdf', validateRequest(exportSchema), async (req, res) => {
  const { catalogData, quality, options } = req.body;

  try {
    logger.info(`Generating PDF for: ${catalogData.generatedContent.title}`);

    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Color scheme mapping
    const colorSchemes = {
      blue: { primary: rgb(0.15, 0.39, 0.92), secondary: rgb(0.93, 0.96, 1) },
      purple: { primary: rgb(0.49, 0.23, 0.93), secondary: rgb(0.97, 0.93, 1) },
      green: { primary: rgb(0.02, 0.59, 0.41), secondary: rgb(0.93, 1, 0.97) },
      red: { primary: rgb(0.92, 0.26, 0.21), secondary: rgb(1, 0.93, 0.93) }
    };

    const colors = colorSchemes[catalogData.layout.colorScheme] || colorSchemes.blue;

    // Add first page
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();

    let yPosition = height - 80;

    // Header with background
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: colors.primary,
    });

    // Title
    page.drawText(catalogData.generatedContent.title, {
      x: 50,
      y: height - 70,
      size: 24,
      font: helveticaBoldFont,
      color: rgb(1, 1, 1),
      maxWidth: width - 100,
    });

    // Subtitle
    page.drawText('Professional Product Catalog', {
      x: 50,
      y: height - 100,
      size: 14,
      font: helveticaFont,
      color: rgb(0.9, 0.9, 0.9),
    });

    yPosition = height - 160;

    // Description section
    page.drawText('Product Overview', {
      x: 50,
      y: yPosition,
      size: 18,
      font: helveticaBoldFont,
      color: colors.primary,
    });

    yPosition -= 30;

    // Split description into lines
    const descriptionLines = wrapText(catalogData.generatedContent.description, 70);
    for (const line of descriptionLines.slice(0, 8)) { // Limit lines
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 11,
        font: timesRomanFont,
        color: rgb(0.2, 0.2, 0.2),
      });
      yPosition -= 16;
    }

    yPosition -= 20;

    // Features section
    if (options.includeFeatures && catalogData.generatedContent.features.length > 0) {
      page.drawText('Key Features', {
        x: 50,
        y: yPosition,
        size: 16,
        font: helveticaBoldFont,
        color: colors.primary,
      });

      yPosition -= 25;

      for (const feature of catalogData.generatedContent.features.slice(0, 6)) {
        page.drawText(`• ${feature}`, {
          x: 60,
          y: yPosition,
          size: 10,
          font: helveticaFont,
          color: rgb(0.3, 0.3, 0.3),
          maxWidth: width - 120,
        });
        yPosition -= 18;
      }

      yPosition -= 15;
    }

    // Specifications section
    if (options.includeSpecs && Object.keys(catalogData.generatedContent.specifications).length > 0) {
      page.drawText('Specifications', {
        x: 50,
        y: yPosition,
        size: 16,
        font: helveticaBoldFont,
        color: colors.primary,
      });

      yPosition -= 25;

      const specs = Object.entries(catalogData.generatedContent.specifications).slice(0, 8);
      for (const [key, value] of specs) {
        page.drawText(`${key}:`, {
          x: 60,
          y: yPosition,
          size: 10,
          font: helveticaBoldFont,
          color: rgb(0.2, 0.2, 0.2),
        });

        page.drawText(value.toString(), {
          x: 200,
          y: yPosition,
          size: 10,
          font: helveticaFont,
          color: rgb(0.4, 0.4, 0.4),
          maxWidth: width - 250,
        });

        yPosition -= 18;
      }
    }

    // Footer
    page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: 30,
      size: 8,
      font: helveticaFont,
      color: rgb(0.6, 0.6, 0.6),
    });

    page.drawText('Created with Product Catalog Generator', {
      x: width - 250,
      y: 30,
      size: 8,
      font: helveticaFont,
      color: rgb(0.6, 0.6, 0.6),
    });

    const pdfBytes = await pdfDoc.save();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${catalogData.generatedContent.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`);
    res.setHeader('Content-Length', pdfBytes.length);

    res.send(Buffer.from(pdfBytes));

    logger.info(`PDF generated successfully for: ${catalogData.generatedContent.title}`);

  } catch (error) {
    logger.error('PDF generation error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF',
      message: error.message
    });
  }
});

// Export catalog as DOCX
router.post('/docx', validateRequest(exportSchema), async (req, res) => {
  const { catalogData, options } = req.body;

  try {
    logger.info(`Generating DOCX for: ${catalogData.generatedContent.title}`);

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: catalogData.generatedContent.title,
                bold: true,
                size: 32,
                color: "2563EB",
              }),
            ],
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Subtitle
          new Paragraph({
            children: [
              new TextRun({
                text: "Professional Product Catalog",
                size: 20,
                color: "64748B",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),

          // Description
          new Paragraph({
            children: [
              new TextRun({
                text: "Product Overview",
                bold: true,
                size: 24,
                color: "1E293B",
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: catalogData.generatedContent.description,
                size: 22,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Features
          ...(options.includeFeatures ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Key Features",
                  bold: true,
                  size: 24,
                  color: "1E293B",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            }),
            ...catalogData.generatedContent.features.map(feature => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${feature}`,
                    size: 20,
                  }),
                ],
                spacing: { after: 100 },
              })
            ),
          ] : []),

          // Specifications
          ...(options.includeSpecs ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Specifications",
                  bold: true,
                  size: 24,
                  color: "1E293B",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            }),
            ...Object.entries(catalogData.generatedContent.specifications).map(([key, value]) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${key}: `,
                    bold: true,
                    size: 20,
                  }),
                  new TextRun({
                    text: value.toString(),
                    size: 20,
                  }),
                ],
                spacing: { after: 100 },
              })
            ),
          ] : []),

          // Benefits
          ...(options.includeBenefits ? [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Why Choose This Product",
                  bold: true,
                  size: 24,
                  color: "1E293B",
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            }),
            ...catalogData.generatedContent.benefits.map(benefit => 
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${benefit}`,
                    size: 20,
                  }),
                ],
                spacing: { after: 100 },
              })
            ),
          ] : []),

          // Footer
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated on ${new Date().toLocaleDateString()} with Product Catalog Generator`,
                size: 16,
                color: "94A3B8",
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 800 },
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${catalogData.generatedContent.title.replace(/[^a-zA-Z0-9]/g, '-')}.docx"`);
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);

    logger.info(`DOCX generated successfully for: ${catalogData.generatedContent.title}`);

  } catch (error) {
    logger.error('DOCX generation error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate DOCX',
      message: error.message
    });
  }
});

// Helper function to wrap text
function wrapText(text, maxLength) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word);
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export default router;
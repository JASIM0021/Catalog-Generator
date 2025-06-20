// components/CatalogPDFDocument.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { CatalogData } from '../types';

// Register fonts if needed
// Font.register({ family: 'Open Sans', src: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap' });

interface CatalogPDFDocumentProps {
  catalogData: CatalogData;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 10,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

const CatalogPDFDocument: React.FC<CatalogPDFDocumentProps> = ({
  catalogData,
}) => {
  const images = catalogData.images.length
    ? catalogData.images
    : catalogData.images.map((url, i) => ({
        id: `ext-${i}`,
        url,
        alt: `Image ${i + 1}`,
      }));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{catalogData.generatedContent.title}</Text>
          <Text>{catalogData.generatedContent.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Images</Text>
          <View style={styles.imageGrid}>
            {images.slice(0, 4).map(img => (
              <Image key={img.id} style={styles.image} src={img.url} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Key Features</Text>
          {catalogData.generatedContent.features.map((feature, idx) => (
            <Text key={idx}>• {feature}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>Specifications</Text>
          {Object.entries(catalogData.generatedContent.specifications).map(
            ([key, val]) => (
              <View key={key} style={styles.specRow}>
                <Text>{key}</Text>
                <Text>{val}</Text>
              </View>
            ),
          )}
        </View>

        {catalogData.generatedContent.benefits?.length > 0 && (
          <View style={styles.section}>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>Benefits</Text>
            {catalogData.generatedContent.benefits.map((benefit, i) => (
              <Text key={i}>✓ {benefit}</Text>
            ))}
          </View>
        )}

        <Text style={styles.price}>
          Price: {catalogData.product.price || '$199.99'}
        </Text>
      </Page>
    </Document>
  );
};

export default CatalogPDFDocument;

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

const Section = ({ title, children, isFirst = false }: { title: string, children: React.ReactNode, isFirst?: boolean }) => {
    const colorScheme = useColorScheme() ?? 'light';
    return (
      <View style={[styles.section, { marginTop: isFirst ? 0 : 24 }]}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>{title}</Text>
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].background, shadowColor: Colors[colorScheme].text }]}>
          {children}
        </View>
      </View>
    );
};

const ContactButton = ({ icon, title, subtitle, url }: { icon: any, title: string, subtitle: string, url: string }) => {
    const colorScheme = useColorScheme() ?? 'light';
    return (
        <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(url)}>
            <FontAwesome name={icon} size={20} color={Colors.light.tint} style={styles.rowIcon} />
            <View style={styles.rowTextContainer}>
                <Text style={[styles.rowText, { color: Colors[colorScheme].text }]}>{title}</Text>
                {subtitle && <Text style={[styles.rowDescription, { color: Colors[colorScheme].icon }]}>{subtitle}</Text>}
            </View>
            <FontAwesome name="external-link" size={16} color={Colors[colorScheme].icon}/>
        </TouchableOpacity>
    );
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const colorScheme = useColorScheme() ?? 'light';
    return (
        <View style={styles.faqItem}>
            <Text style={[styles.faqQuestion, { color: Colors[colorScheme].text }]}>{question}</Text>
            <Text style={[styles.faqAnswer, { color: Colors[colorScheme].icon }]}>{answer}</Text>
        </View>
    );
}

export default function HelpScreen() {
    const colorScheme = useColorScheme() ?? 'light';

    return (
        <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
            <Section title="Contacto" isFirst={true}>
                <ContactButton icon="envelope" title="Email" subtitle="soporte@ecopoints.com" url="mailto:soporte@ecopoints.com" />
                 <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background}]} />
                <ContactButton icon="phone" title="Teléfono" subtitle="+51 987 654 321" url="tel:+51987654321" />
            </Section>

            <Section title="Preguntas Frecuentes">
                <FAQItem 
                    question="¿Cómo gano puntos?"
                    answer="Escanea códigos QR en nuestras estaciones de reciclaje. Cada escaneo te otorga puntos según el material."
                />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background}]} />
                <FAQItem 
                    question="¿Cómo canjeo mis puntos?"
                    answer="Ve a la sección de Recompensas, elige el premio que desees y presiona 'Canjear'."
                />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background}]} />
                <FAQItem 
                    question="¿Dónde encuentro estaciones de reciclaje?"
                    answer="Actualmente tenemos estaciones en Miraflores, San Isidro, Surco y Barranco. Próximamente en más distritos."
                />
                 <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background}]} />
                <FAQItem 
                    question="¿Los puntos expiran?"
                    answer="No, tus EcoPoints nunca expiran. Acumúlalos todo el tiempo que quieras."
                />
            </Section>

             <Section title="Síguenos">
                <ContactButton icon="instagram" title="Instagram" subtitle="@ecopoints" url="https://instagram.com" />
                <View style={[styles.separator, {backgroundColor: Colors[colorScheme].background}]} />
                <ContactButton icon="facebook-square" title="Facebook" subtitle="/ecopoints" url="https://facebook.com" />
            </Section>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1,
      paddingTop: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowIcon: {
      marginRight: 16,
      width: 20,
      textAlign: 'center',
  },
  rowTextContainer: {
      flex: 1,
  },
  rowText: {
    fontSize: 16,
  },
  rowDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginHorizontal: 16,
  },
  faqItem: {
      paddingVertical: 16,
      paddingHorizontal: 16,
  },
  faqQuestion: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 6,
  },
  faqAnswer: {
      fontSize: 14,
      lineHeight: 20,
  }
});
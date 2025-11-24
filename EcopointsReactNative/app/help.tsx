import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

const Section = ({ title, children, isFirst = false }: { title: string, children: React.ReactNode, isFirst?: boolean }) => {
    const colorScheme = useColorScheme() ?? 'light';
    return (
      <View style={[styles.section, { marginTop: isFirst ? 0 : 24 }]}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>{title}</Text>
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].background, shadowColor: Colors[colorScheme].text, overflow: 'hidden' }]}>
          {children}
        </View>
      </View>
    );
};

const ActionButton = ({ icon, title, subtitle, url, isExternal = false, action, isFirst = false, isLast = false }: { icon: any, title: string, subtitle?: string, url?: string, isExternal?: boolean, action?: () => void, isFirst?: boolean, isLast?: boolean }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const handlePress = () => {
        if (url) Linking.openURL(url);
        if (action) action();
    };
    return (
        <TouchableOpacity style={[styles.row, isFirst && {paddingTop: 16}, isLast && {paddingBottom: 16}]} onPress={handlePress}>
            <FontAwesome name={icon} size={20} color={Colors.light.tint} style={styles.rowIcon} />
            <View style={styles.rowTextContainer}>
                <Text style={[styles.rowText, { color: Colors[colorScheme].text }]}>{title}</Text>
                {subtitle && <Text style={[styles.rowDescription, { color: Colors[colorScheme].icon }]}>{subtitle}</Text>}
            </View>
            <FontAwesome name={isExternal ? "external-link" : "chevron-right"} size={16} color={Colors[colorScheme].icon}/>
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
            <View style={[styles.introCard, {backgroundColor: '#E0F2F1'}]}>
                <FontAwesome name="question-circle" size={24} color={Colors.light.tint} />
                <Text style={[styles.introTitle, {color: Colors.light.tint}]}>¿Necesitas ayuda?</Text>
                <Text style={[styles.introText, {color: Colors.light.tint}]}>
                    Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios.
                </Text>
            </View>

            <Section title="Contacto">
                <ActionButton icon="comments" title="Chat en vivo" subtitle="Disponible 24/7" action={() => Alert.alert('Chat en vivo', 'Nuestro chat en vivo estará disponible pronto.')} isFirst />
                <View style={styles.separator} />
                <ActionButton icon="envelope" title="Email" subtitle="soporte@ecopoints.com" url="mailto:soporte@ecopoints.com" isExternal />
                <View style={styles.separator} />
                <ActionButton icon="phone" title="Teléfono" subtitle="+51 987 654 321" url="tel:+51987654321" isExternal isLast />
            </Section>

            <Section title="Preguntas Frecuentes">
                <FAQItem question="¿Cómo gano puntos?" answer="Escanea códigos QR en nuestras estaciones de reciclaje. Cada escaneo te otorga entre 10 y 100 puntos según el material reciclado." />
                <View style={styles.separator} />
                <FAQItem question="¿Cómo canjeo mis puntos?" answer='Ve a la sección de Recompensas, elige el premio que desees y presiona "Canjear". Los códigos se envían a tu email.' />
                <View style={styles.separator} />
                <FAQItem question="¿Dónde encuentro estaciones de reciclaje?" answer="Actualmente tenemos estaciones en Miraflores, San Isidro, Surco y Barranco. Próximamente en más distritos." />
                <View style={styles.separator} />
                <FAQItem question="¿Los puntos expiran?" answer="No, tus EcoPoints nunca expiran. Acumúlalos todo el tiempo que quieras." />
            </Section>

            <Section title="Tutoriales">
                <ActionButton icon="qrcode" title="Cómo escanear códigos QR" action={() => Alert.alert('Tutorial', 'Función en desarrollo.')} isFirst />
                <View style={styles.separator} />
                <ActionButton icon="recycle" title="Guía de reciclaje correcto" action={() => Alert.alert('Tutorial', 'Función en desarrollo.')} />
                <View style={styles.separator} />
                <ActionButton icon="trophy" title="Cómo subir de nivel" action={() => Alert.alert('Tutorial', 'Función en desarrollo.')} isLast />
            </Section>

            <Section title="Reportar un problema">
                 <TouchableOpacity style={styles.reportButton} onPress={() => Alert.alert('Gracias', 'Tu reporte ha sido enviado. Nos pondremos en contacto pronto.')}>
                    <FontAwesome name="send" size={16} color="white" />
                    <Text style={styles.reportButtonText}>Enviar Reporte</Text>
                </TouchableOpacity>
            </Section>

             <Section title="Síguenos">
                <ActionButton icon="instagram" title="Instagram" url="https://instagram.com" isExternal isFirst/>
                <View style={styles.separator} />
                <ActionButton icon="facebook-square" title="Facebook" url="https://facebook.com" isExternal />
                <View style={styles.separator} />
                <ActionButton icon="twitter" title="Twitter" url="https://twitter.com" isExternal />
                <View style={styles.separator} />
                <ActionButton icon="info-circle" title="TikTok" url="https://tiktok.com" isExternal isLast />
            </Section>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1,
      paddingTop: 24,
  },
  introCard: {
    backgroundColor: '#E0F2F1',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  introText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  card: {
    borderRadius: 12,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ccc',
    marginHorizontal: 16,
  },
  faqItem: {
      padding: 16,
  },
  faqQuestion: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 6,
  },
  faqAnswer: {
      fontSize: 14,
      lineHeight: 20,
  },
  reportButton: {
      backgroundColor: Colors.light.tint,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 8,
      margin: 16,
  },
  reportButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
  }
});
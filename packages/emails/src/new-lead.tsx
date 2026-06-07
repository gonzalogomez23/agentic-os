import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface NewLeadEmailProps {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje?: string;
}

const LOGO_URL = 'https://www.gonzalogomezdev.com/logo/gonzalo-gomez-logo.png';
const SITE_URL = 'https://gonzalogomezdev.com';

export function NewLeadEmail({ nombre, email, telefono, mensaje }: NewLeadEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Nuevo contacto de {nombre} — {email}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Franja de acento superior */}
          <Section style={{ padding: '0', margin: '0' }}>
            <Row>
              <Column style={{ backgroundColor: ACCENT, height: '4px', lineHeight: '4px', fontSize: '1px' }}>
                &nbsp;
              </Column>
            </Row>
          </Section>

          {/* Cabecera con logo */}
          <Section style={logoSection}>
            <Img
              src={LOGO_URL}
              alt="Gonzalo Gómez"
              height={38}
              style={{ display: 'block', margin: '0 auto' }}
            />
          </Section>

          <Hr style={divider} />

          {/* Contenido principal */}
          <Section style={contentSection}>

            {/* Etiqueta */}
            <Section style={{ marginBottom: '20px' }}>
              <Row>
                <Column style={{ width: '16px', verticalAlign: 'middle' }}>
                  <div style={dot} />
                </Column>
                <Column style={{ verticalAlign: 'middle' }}>
                  <Text style={eyebrow}>Nuevo contacto · Portfolio</Text>
                </Column>
              </Row>
            </Section>

            {/* Campos */}
            <Field label="Nombre" value={nombre} />
            <Field label="Email" value={email} link={`mailto:${email}`} />
            {telefono && <Field label="Teléfono" value={telefono} link={`tel:${telefono}`} />}
            {mensaje && <Field label="Mensaje" value={mensaje} multiline />}

          </Section>

          {/* Pie */}
          <Hr style={divider} />
          <Section style={footerSection}>
            <Text style={footer}>
              Recibido desde el formulario de contacto de{' '}
              <Link href={SITE_URL} style={footerLink}>gonzalogomezdev.com</Link>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

function Field({
  label,
  value,
  multiline,
  link,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  link?: string;
}) {
  return (
    <Section style={fieldCard}>
      <Text style={fieldLabel}>{label}</Text>
      {link ? (
        <Link href={link} style={fieldValueLink}>{value}</Link>
      ) : (
        <Text style={multiline ? fieldValueMultiline : fieldValue}>{value}</Text>
      )}
    </Section>
  );
}

// ─── Tokens ────────────────────────────────────────────────────────────────

const DARK_BLUE = '#102132';
const DIM       = '#4D6478';
const FAINT     = '#9BAEBB';
const BORDER    = '#D8DCE2';
const BG_PAGE   = '#F0F2F4';
const BG_FIELD  = '#F7F9FB';
const ACCENT    = DARK_BLUE;
const FONT      = '"Helvetica Neue", Arial, sans-serif';

// ─── Estilos ───────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: BG_PAGE,
  fontFamily: FONT,
  margin: '0',
  padding: '0',
};

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  border: `1px solid ${BORDER}`,
};

const logoSection: React.CSSProperties = {
  padding: '28px 32px 24px',
  textAlign: 'center',
};

const divider: React.CSSProperties = {
  borderColor: BORDER,
  borderTopWidth: '1px',
  margin: '0',
};

const contentSection: React.CSSProperties = {
  padding: '32px 32px 20px',
};

const dot: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: ACCENT,
  display: 'inline-block',
};

const eyebrow: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  color: DIM,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  margin: '0',
  paddingLeft: '6px',
};

const fieldCard: React.CSSProperties = {
  backgroundColor: BG_FIELD,
  borderLeft: `3px solid ${BORDER}`,
  padding: '12px 16px',
  marginBottom: '8px',
};

const fieldLabel: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: '700',
  color: FAINT,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  margin: '0 0 4px',
};

const fieldValue: React.CSSProperties = {
  fontSize: '15px',
  color: DARK_BLUE,
  margin: '0',
  lineHeight: '1.5',
};

const fieldValueLink: React.CSSProperties = {
  fontSize: '15px',
  color: DARK_BLUE,
  textDecoration: 'underline',
  textDecorationColor: BORDER,
  display: 'block',
  lineHeight: '1.5',
};

const fieldValueMultiline: React.CSSProperties = {
  ...fieldValue,
  whiteSpace: 'pre-wrap',
  lineHeight: '1.7',
  color: DIM,
};

const footerSection: React.CSSProperties = {
  padding: '16px 32px 20px',
};

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: FAINT,
  margin: '0',
  textAlign: 'center',
};

const footerLink: React.CSSProperties = {
  color: FAINT,
  textDecoration: 'underline',
};

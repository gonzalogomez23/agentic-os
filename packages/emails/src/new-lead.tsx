import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
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

export function NewLeadEmail({ nombre, email, telefono, mensaje }: NewLeadEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Nuevo lead de {nombre} — {email}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Nuevo lead del portfolio</Heading>
          <Hr style={hr} />
          <Section style={section}>
            <Field label="Nombre" value={nombre} />
            <Field label="Email" value={email} />
            {telefono && <Field label="Teléfono" value={telefono} />}
            {mensaje && <Field label="Mensaje" value={mensaje} multiline />}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <Section style={fieldRow}>
      <Text style={fieldLabel}>{label}</Text>
      <Text style={multiline ? fieldValueMultiline : fieldValue}>{value}</Text>
    </Section>
  );
}

const body: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: '520px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '32px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

const heading: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#111',
  margin: '0 0 16px',
};

const hr: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '0 0 24px',
};

const section: React.CSSProperties = {
  gap: '0',
};

const fieldRow: React.CSSProperties = {
  marginBottom: '16px',
};

const fieldLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#71717a',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '0 0 2px',
};

const fieldValue: React.CSSProperties = {
  fontSize: '15px',
  color: '#18181b',
  margin: '0',
};

const fieldValueMultiline: React.CSSProperties = {
  ...fieldValue,
  whiteSpace: 'pre-wrap',
  lineHeight: '1.6',
};

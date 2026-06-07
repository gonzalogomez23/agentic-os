import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Body, Container, Head, Hr, Html, Img, Link, Preview, Row, Column, Section, Text, } from '@react-email/components';
const LOGO_URL = 'https://www.gonzalogomezdev.com/logo/gonzalo-gomez-logo.png';
const SITE_URL = 'https://gonzalogomezdev.com';
export function NewLeadEmail({ nombre, email, telefono, mensaje }) {
    return (_jsxs(Html, { lang: "es", children: [_jsx(Head, { children: _jsx("style", { children: `
          :root, body { color-scheme: light only; }
          body, table, td, th, div, p, a { color-scheme: light only; }
          body { background-color: ${BG_PAGE} !important; }
          table { background-color: #ffffff !important; }
        ` }) }), _jsxs(Preview, { children: ["Nuevo contacto de ", nombre, " \u2014 ", email] }), _jsx(Body, { style: body, children: _jsxs(Container, { style: container, children: [_jsx(Section, { style: { padding: '0', margin: '0' }, children: _jsx(Row, { children: _jsx(Column, { style: { backgroundColor: ACCENT, height: '4px', lineHeight: '4px', fontSize: '1px' }, children: "\u00A0" }) }) }), _jsx(Section, { style: logoSection, children: _jsx(Img, { src: LOGO_URL, alt: "Gonzalo G\u00F3mez", height: 38, style: { display: 'block', margin: '0 auto' } }) }), _jsx(Hr, { style: divider }), _jsxs(Section, { style: contentSection, children: [_jsx(Section, { style: { marginBottom: '20px' }, children: _jsxs(Row, { children: [_jsx(Column, { style: { width: '16px', verticalAlign: 'middle' }, children: _jsx("div", { style: dot }) }), _jsx(Column, { style: { verticalAlign: 'middle' }, children: _jsx(Text, { style: eyebrow, children: "Nuevo contacto \u00B7 Portfolio" }) })] }) }), _jsx(Field, { label: "Nombre", value: nombre }), _jsx(Field, { label: "Email", value: email, link: `mailto:${email}` }), telefono && _jsx(Field, { label: "Tel\u00E9fono", value: telefono, link: `tel:${telefono}` }), mensaje && _jsx(Field, { label: "Mensaje", value: mensaje, multiline: true })] }), _jsx(Hr, { style: divider }), _jsx(Section, { style: footerSection, children: _jsxs(Text, { style: footer, children: ["Recibido desde el formulario de contacto de", ' ', _jsx(Link, { href: SITE_URL, style: footerLink, children: "gonzalogomezdev.com" })] }) })] }) })] }));
}
function Field({ label, value, multiline, link, }) {
    return (_jsxs(Section, { style: fieldCard, children: [_jsx(Text, { style: fieldLabel, children: label }), link ? (_jsx(Link, { href: link, style: fieldValueLink, children: value })) : (_jsx(Text, { style: multiline ? fieldValueMultiline : fieldValue, children: value }))] }));
}
// ─── Tokens ────────────────────────────────────────────────────────────────
const DARK_BLUE = '#102132';
const DIM = '#4D6478';
const FAINT = '#9BAEBB';
const BORDER = '#D8DCE2';
const BG_PAGE = '#F0F2F4';
const BG_FIELD = '#F7F9FB';
const ACCENT = DARK_BLUE;
const FONT = '"Helvetica Neue", Arial, sans-serif';
// ─── Estilos ───────────────────────────────────────────────────────────────
const body = {
    backgroundColor: BG_PAGE,
    fontFamily: FONT,
    margin: '0',
    padding: '0',
};
const container = {
    maxWidth: '560px',
    margin: '40px auto',
    backgroundColor: '#ffffff',
    border: `1px solid ${BORDER}`,
};
const logoSection = {
    padding: '28px 32px 24px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
};
const divider = {
    borderColor: BORDER,
    borderTopWidth: '1px',
    margin: '0',
};
const contentSection = {
    padding: '32px 32px 20px',
    backgroundColor: '#ffffff',
};
const dot = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: ACCENT,
    display: 'inline-block',
};
const eyebrow = {
    fontSize: '11px',
    fontWeight: '600',
    color: DIM,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    margin: '0',
    paddingLeft: '6px',
};
const fieldCard = {
    backgroundColor: BG_FIELD,
    borderLeft: `3px solid ${BORDER}`,
    padding: '12px 16px',
    marginBottom: '8px',
};
const fieldLabel = {
    fontSize: '10px',
    fontWeight: '700',
    color: FAINT,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    margin: '0 0 4px',
};
const fieldValue = {
    fontSize: '15px',
    color: DARK_BLUE,
    margin: '0',
    lineHeight: '1.5',
};
const fieldValueLink = {
    fontSize: '15px',
    color: DARK_BLUE,
    textDecoration: 'underline',
    textDecorationColor: BORDER,
    display: 'block',
    lineHeight: '1.5',
};
const fieldValueMultiline = {
    ...fieldValue,
    whiteSpace: 'pre-wrap',
    lineHeight: '1.7',
    color: DIM,
};
const footerSection = {
    padding: '16px 32px 20px',
    backgroundColor: '#ffffff',
};
const footer = {
    fontSize: '12px',
    color: FAINT,
    margin: '0',
    textAlign: 'center',
};
const footerLink = {
    color: FAINT,
    textDecoration: 'underline',
};

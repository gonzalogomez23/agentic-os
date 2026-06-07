import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, } from '@react-email/components';
export function NewLeadEmail({ nombre, email, telefono, mensaje }) {
    return (_jsxs(Html, { lang: "es", children: [_jsx(Head, {}), _jsxs(Preview, { children: ["Nuevo lead de ", nombre, " \u2014 ", email] }), _jsx(Body, { style: body, children: _jsxs(Container, { style: container, children: [_jsx(Heading, { style: heading, children: "Nuevo lead del portfolio" }), _jsx(Hr, { style: hr }), _jsxs(Section, { style: section, children: [_jsx(Field, { label: "Nombre", value: nombre }), _jsx(Field, { label: "Email", value: email }), telefono && _jsx(Field, { label: "Tel\u00E9fono", value: telefono }), mensaje && _jsx(Field, { label: "Mensaje", value: mensaje, multiline: true })] })] }) })] }));
}
function Field({ label, value, multiline }) {
    return (_jsxs(Section, { style: fieldRow, children: [_jsx(Text, { style: fieldLabel, children: label }), _jsx(Text, { style: multiline ? fieldValueMultiline : fieldValue, children: value })] }));
}
const body = {
    backgroundColor: '#f4f4f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};
const container = {
    maxWidth: '520px',
    margin: '40px auto',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};
const heading = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111',
    margin: '0 0 16px',
};
const hr = {
    borderColor: '#e4e4e7',
    margin: '0 0 24px',
};
const section = {
    gap: '0',
};
const fieldRow = {
    marginBottom: '16px',
};
const fieldLabel = {
    fontSize: '11px',
    fontWeight: '600',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 2px',
};
const fieldValue = {
    fontSize: '15px',
    color: '#18181b',
    margin: '0',
};
const fieldValueMultiline = {
    ...fieldValue,
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
};

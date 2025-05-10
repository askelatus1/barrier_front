export const COLORS = {
  background: {
    primary: '#232325',
    secondary: '#333333',
    tertiary: '#2a2a2a',
    quaternary: '#3d3d3d',
  },
  border: {
    primary: '#1a1a1a',
    secondary: '#151515',
    tertiary: '#1f1f1f',
  },
  text: {
    primary: '#ffd988',
    secondary: '#d9c48d',
  },
  button: {
    background: '#424242',
  },
} as const;

export const SIZES = {
  header: {
    height: '51px',
    minHeight: '51px',
    logo: {
      width: '42px',
      height: '42px',
    },
    helpButton: {
      width: '22px',
      height: '22px',
      borderRadius: '11px',
    },
  },
  card: {
    minWidth: '380px',
  },
} as const; 
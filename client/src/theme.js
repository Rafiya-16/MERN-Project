import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'light' ? 'linear-gradient(180deg,rgba(155, 42, 153, 1) 0%, rgba(222, 129, 203, 0.99) 50%, rgba(242, 17, 107, 1) 100%)' : 'linear-gradient(to top right,  #8fe68fff, #a1e9ea, #81d4f3)',
      },
    }),
  },
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#f472b6',
      500: '#e20ee9ff',
      600: '#9333ea',
      700: '#5a03a1ff',
      800: '#075985',
      900: '#0c4a6e',
    },
  },
  components: {
    Button: {
     variants: {
        solid: {
          bgGradient: 'linear(to-r, pink.400, purple.400)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, pink.500, purple.500)',
          },
        },
      },
    },
  },
});

export default theme;
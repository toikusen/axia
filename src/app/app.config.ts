import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { MessageService } from 'primeng/api';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';

// AXIA Admin dark theme — gold accent on near-black surface
const AxiaAdminPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '{amber.50}',
      100: '{amber.100}',
      200: '{amber.200}',
      300: '{amber.300}',
      400: '{amber.400}',
      500: '#c8a882',
      600: '#b8956a',
      700: '#a07850',
      800: '#855f38',
      900: '#6a4a28',
      950: '#4a3018',
    },
    colorScheme: {
      dark: {
        surface: {
          0:   '#ffffff',
          50:  '#f5efe7',
          100: '#e8ddd0',
          200: '#d9c8b4',
          300: '#c8a882',
          400: '#a88860',
          500: '#7a6248',
          600: '#4a3c2c',
          700: '#2d241c',
          800: '#221d18',
          900: '#1a1510',
          950: '#12100c',
        },
        primary: {
          color:         '#c8a882',
          contrastColor: '#171412',
          hoverColor:    '#d9b990',
          activeColor:   '#b89670',
        },
        highlight: {
          background:    'rgba(200, 168, 130, 0.15)',
          focusBackground: 'rgba(200, 168, 130, 0.20)',
          color:         '#c8a882',
          focusColor:    '#d9b990',
        },
        formField: {
          background:             'rgba(255,255,255,0.03)',
          disabledBackground:     'rgba(255,255,255,0.01)',
          filledBackground:       'rgba(255,255,255,0.06)',
          filledHoverBackground:  'rgba(255,255,255,0.08)',
          filledFocusBackground:  'rgba(255,255,255,0.06)',
          borderColor:            'rgba(200,168,130,0.40)',
          hoverBorderColor:       'rgba(200,168,130,0.65)',
          focusBorderColor:       '#c8a882',
          invalidBorderColor:     '#f87171',
          color:                  '#f5efe7',
          disabledColor:          'rgba(245,239,231,0.35)',
          placeholderColor:       'rgba(245,239,231,0.30)',
          invalidPlaceholderColor:'#fca5a5',
          floatLabelColor:        'rgba(245,239,231,0.45)',
          floatLabelFocusColor:   '#c8a882',
          floatLabelActiveColor:  '#c8a882',
          floatLabelInvalidColor: '#f87171',
          iconColor:              'rgba(200,168,130,0.70)',
          shadow:                 'none',
        },
        text: {
          color:        '#f5efe7',
          hoverColor:   '#ffffff',
          mutedColor:   'rgba(245,239,231,0.50)',
          hoverMutedColor: 'rgba(245,239,231,0.70)',
        },
        content: {
          background:      '#1e1a16',
          hoverBackground: 'rgba(200,168,130,0.06)',
          borderColor:     'rgba(200,168,130,0.14)',
          color:           '#f5efe7',
          hoverColor:      '#ffffff',
        },
        overlay: {
          select: {
            background:  '#1c1814',
            borderColor: 'rgba(200,168,130,0.22)',
            color:       '#f5efe7',
          },
          popover: {
            background:  '#1c1814',
            borderColor: 'rgba(200,168,130,0.22)',
            color:       '#f5efe7',
          },
          modal: {
            background:  '#221d18',
            borderColor: 'rgba(200,168,130,0.18)',
            color:       '#f5efe7',
          },
        },
        list: {
          option: {
            focusBackground:    'rgba(200,168,130,0.10)',
            selectedBackground: 'rgba(200,168,130,0.18)',
            selectedFocusBackground: 'rgba(200,168,130,0.24)',
            color:              '#f5efe7',
            focusColor:         '#ffffff',
            selectedColor:      '#c8a882',
            selectedFocusColor: '#d9b990',
            icon: {
              color:      'rgba(200,168,130,0.60)',
              focusColor: '#c8a882',
            },
          },
          optionGroup: {
            background: 'transparent',
            color:      'rgba(200,168,130,0.60)',
          },
        },
        navigation: {
          item: {
            focusBackground:    'rgba(200,168,130,0.08)',
            activeBackground:   'rgba(200,168,130,0.14)',
            color:              'rgba(245,239,231,0.65)',
            focusColor:         '#f5efe7',
            activeColor:        '#c8a882',
          },
          submenuLabel: {
            background: 'transparent',
            color:      'rgba(245,239,231,0.35)',
          },
          submenuIcon: {
            color:      'rgba(245,239,231,0.50)',
            focusColor: '#f5efe7',
            activeColor:'#c8a882',
          },
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    MessageService,
    provideAnimationsAsync(),
    provideRouter(routes),
    providePrimeNG({
      ripple: true,
      inputStyle: 'outlined',
      theme: {
        preset: AxiaAdminPreset,
        options: {
          prefix: 'p',
          darkModeSelector: ':root',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities',
          },
        },
      },
    }),
  ],
};

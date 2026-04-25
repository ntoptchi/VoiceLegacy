---
name: Warm Minimalism
colors:
  surface: '#fbf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#f0eded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#424843'
  inverse-surface: '#303030'
  inverse-on-surface: '#f2f0f0'
  outline: '#727972'
  outline-variant: '#c2c8c1'
  surface-tint: '#486550'
  primary: '#47644f'
  on-primary: '#ffffff'
  primary-container: '#5f7d67'
  on-primary-container: '#ffffff'
  inverse-primary: '#aeceb5'
  secondary: '#496175'
  on-secondary: '#ffffff'
  secondary-container: '#cde5fe'
  on-secondary-container: '#4f677c'
  tertiary: '#8c4c34'
  on-tertiary: '#ffffff'
  tertiary-container: '#a9644b'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#caebd0'
  primary-fixed-dim: '#aeceb5'
  on-primary-fixed: '#042110'
  on-primary-fixed-variant: '#304d3a'
  secondary-fixed: '#cde5fe'
  secondary-fixed-dim: '#b1c9e1'
  on-secondary-fixed: '#021e2f'
  on-secondary-fixed-variant: '#32495d'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59b'
  on-tertiary-fixed: '#380d00'
  on-tertiary-fixed-variant: '#703620'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The brand personality of this design system is deeply rooted in empathy, legacy, and human connection. It aims to evoke a sense of quiet reflection and safety, positioning the interface as a digital sanctuary for preserving one’s most personal asset—the voice. The target audience includes individuals looking to document their history and families wishing to preserve the essence of a loved one, spanning multiple generations.

The visual style is **Warm Minimalism**. It prioritizes clarity and ease of use through heavy whitespace and a refined color palette, but departs from cold, clinical minimalism by using "human" textures and soft tones. The interface should feel like a high-quality physical journal: intentional, durable, and comforting. Every interaction is designed to reduce anxiety, using gentle transitions and a supportive layout that guides the user through the sensitive process of voice recording and archiving.

## Colors

The color palette for this design system is inspired by nature and archival materials. The primary color is a muted **Sage Green**, chosen for its associations with growth and tranquility. The secondary color is a **Soft Blue**, used to denote supportive actions and information. A tertiary **Terracotta** is used sparingly for highlights that require warmth without being aggressive.

The background is a **Warm Cream** rather than a pure white to reduce eye strain and provide a more "analog" feel. Text is rendered in a deep **Slate Gray** to ensure high contrast for accessibility while maintaining a softer edge than pure black. High-contrast ratios (WCAG AAA for body text) are maintained across all interactive elements to ensure legibility for older demographics.

## Typography

This design system utilizes **Plus Jakarta Sans** for all levels of the hierarchy. This font was selected for its modern, friendly, and geometric proportions that remain highly legible at large scales.

The typography scale is intentionally oversized to prioritize accessibility. Body text starts at 18px to ensure comfortable reading for all age groups. Line heights are generous (1.6x for body text) to prevent visual crowding and aid in tracking lines of text. Headings use a slightly tighter letter spacing and heavier weights to create a clear visual anchor on the page. All labels and instructional text are rendered with enough weight to pass contrast checks against the warm background.

## Layout & Spacing

The layout philosophy for this design system follows a **fluid grid** model with significant padding to create a "breathing" interface. It uses an 8px base unit to maintain mathematical harmony across all components.

Margins are wider than standard applications (32px minimum on mobile) to focus the user’s eye on the center of the screen, reducing peripheral noise. On larger screens, content is constrained to a maximum width of 1024px to maintain optimal line lengths for readability. Spacing between sections is generous, using the `lg` (48px) and `xl` (80px) units to clearly delineate different steps in the voice preservation journey.

## Elevation & Depth

Hierarchy in this design system is established through **Tonal Layers** and **Ambient Shadows**. Instead of harsh drop shadows, elements that require elevation—such as recording cards or action modals—use very soft, diffused shadows with a slight color tint derived from the primary sage green. This makes the shadows feel like they are part of the environment rather than a digital overlay.

Interactive surfaces use subtle inner glows or low-contrast outlines (1px solid with 10% opacity) to define their boundaries without creating visual clutter. Depth is also communicated through "Surface-Container" tiers: the main background is the lowest tier, while "cards" sit on a slightly lighter surface to signify they are interactable objects.

## Shapes

The shape language of this design system is defined by soft, approachable curves. A **Rounded (Level 2)** setting is applied across the system to eliminate sharp corners that can feel aggressive or clinical.

Base components like buttons and small cards use a 0.5rem radius. Larger containers, such as voice-note previews or main navigation panels, utilize `rounded-xl` (1.5rem) to emphasize a soft, "pill-like" containers that feel safe to touch. Form inputs follow the standard base roundedness to maintain a structured, professional feel while remaining consistent with the overall organic aesthetic.

## Components

### Buttons
Buttons are oversized with a minimum height of 56px to provide large touch targets. Primary buttons use the Sage Green background with white text, while secondary buttons use the Soft Blue. Hover and active states are indicated by a subtle deepening of the color rather than a sudden shift.

### Cards
Cards are the primary container for information. They feature a soft 1.5rem corner radius and a very light ambient shadow. To signify importance, cards can include a "Warm Cream" header area to separate meta-data from primary content.

### Form Elements
Inputs are designed with clear, always-visible labels above the field. The border weight increases slightly on focus, using the primary Sage Green to provide a clear visual cue without relying solely on color.

### Audio Visualizers
A custom component for this system, audio visualizers should use soft, rounded bars in the secondary blue. These represent the "life" of the recording and should animate smoothly to provide supportive feedback during the recording process.

### Progress Indicators
Steppers for the onboarding or legacy-building process should be large and clear, using "check" icons and text labels to ensure users always know their current stage in the journey.
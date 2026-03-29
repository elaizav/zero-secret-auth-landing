# Algorithm Notes

## Active section highlighting

The project does not use a complex routing system. Instead, it relies on `IntersectionObserver` to determine which section is currently dominant in the viewport.

Shared observer parameters:

- `threshold: 0.45`
- `rootMargin: -10% 0px -35% 0px`

This combination makes the active-link behavior stable enough for a long one-page layout.

## Menu state normalization

Rather than hard-coding labels directly inside event handlers, the script derives a normalized menu state from:

- current open/closed state;
- current page language.

This keeps behavior consistent across all pages and simplifies documentation examples in tests.

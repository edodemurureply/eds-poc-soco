# Global Layout package acceptance

This folder is an independent, copyable package for the Global Layout saved
contract. It contains four supported blocks, responsive/appearance styles,
editor helpers, sanitizer, authoring contributions, fixtures and tests.
It does not import the originating website or bundle the App Builder extension.

The approved rename is breaking: no previous custom identifiers or fallbacks are
supported. No CMS migration or deployment is included.

Acceptance:

- JS/CSS imports resolve inside this folder; host AEM functions are explicit callbacks.
- Authoring contributions use unique IDs and the new saved contract.
- Site and package authoring contracts match.
- Copying this folder alone allows JSON generation, Node tests and the local example.
- Browser checks cover responsive geometry, counts, grouping, widths, gaps,
  ordering, empty columns, count reduction and simulated editor updates.
- Previous custom metadata/placement cannot activate the new behavior.
- README documents installation, theming, source ownership and rollout limitations.

The originating site's current validation record is
`layout/GLOBAL-LAYOUT-PLAN.md`. The README and executable tests are included here
so a copied package does not need that record or the originating checkout.

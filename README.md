# Nimblenomicon
Online rules reference for the Nimble TTRPG. This repository contains all of the official rules for Nimble, as well as a searchable reference guide.

## Content
The Nimblenomicon hosts 3 types of content:
- An online rules reference
- A content database for searching for specific monsters, spells, feats. etcetera.
- A Character builder for generating PDF character sheets

> Note: The character builder will be implemented at a future date. For now, a placeholder page is shown.

The page header includes the Nimblenomicon title to the left, and a centered search bar. When the user selects the search bar, the main content area is hidden and the search bar expands and migrates down to the top of the main content area. When the user begins typing, a list of "cards" appears in a grid showing a preview of the results. If only one card is shown or the search query matches the title of a piece of content exactly, the card moves to the middle of the content area and expands.

On the left side of the page is a navigation sidebar. All of the main sections of the Nimble rules can be found here. When a section of the rules is selected, it is displayed in the main content area. If a section is selected, the subheaders for that section are revealed in the sidebar.

Some content in the main rules is also included in the searchable content "cards". For any text in the rules or content cards that is annotated using markdown link syntax (`[<label>](<URI>)`), the matching card is shown as a tooltip when the user hovers over the word. If the word is clicked or tapped, the card is displayed as a modal in the center of the screen. If a card is displayed on top of another card, the parent card is shifted up and to the left beneath the child card, forming a "stack". If the linked content leads to a rules document, a preview of the relevant content will be displayed on hover, but clicking or tapping will navigate the user to the appropriate page.

### Rules Reference
The rules reference documents can be either markdown files or HTML files.

### Content Card Database
Content Cards are defined as JSON files, markdown files, or HTML files. For markdown and HTML files, the content card shows the provided content as-written. For JSON files, the content is displayed using a standard template in the Nimblenomicon `src/` directory. The JSON file schema includes the following:

```JSON
{
  "template": "string",
  "search_category": "string",
  "label": "string",
  "content": "string"
}
```

> Note: More template types will be introduced at a future date. For now, the JSON content cards simply display the `content` text as markdown, and show the label in the upper-left corner of the card.

## Contributing

### Local Hosting

### PR Guidelines



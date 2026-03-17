---
name: pdf-to-markdown
description: 'Convert PDF documents to Markdown files. Use when: extracting text from PDFs or generating .md from a PDF.'
argument-hint: 'Input PDF path(s) and desired output location (single file or output directory).'
---

# PDF to Markdown

Convert one or more PDF files into Markdown suitable for this repository.

## When to use

Use this skill when the user asks for any of:
- “convert this PDF to markdown” / “PDF to MD” / “import PDF into the vault”
- Extracting text from a PDF into a new `.md` file

## Inputs to confirm (ask only if unclear)

- **Source**: the PDF file path(s)
- **Destination**: output `.md` path (single) or output directory (batch)
- **Images**: whether to extract embedded images (often not needed)
- **Scanned/OCR**: whether the PDF is scanned (no selectable text)

## Procedure

### 1) Quick text check (detect scanned PDFs)

- If you can select/copy text from the PDF, it likely has an embedded text layer.
- If extracted text is empty/garbled, treat it as **scanned** and use the OCR fallback (step 4).

### 2) Prefer `pandoc` if installed

Pandoc often produces cleaner Markdown for text-based PDFs.

- Check: `pandoc --version`
- Convert single PDF:
  - `pandoc -f pdf -t gfm -o OUTPUT.md INPUT.pdf`

If pandoc is missing or output is poor, use the bundled script (step 3).

### 3) Use the bundled converter script (PyMuPDF)

Use [pdf_to_markdown.py](./scripts/pdf_to_markdown.py).

- Install deps:
  - `python -m pip install -r .github/skills/pdf-to-markdown/scripts/requirements.txt`
- Convert single PDF:
  - `python .github/skills/pdf-to-markdown/scripts/pdf_to_markdown.py INPUT.pdf -o OUTPUT.md`
- Batch convert to a folder:
  - `python .github/skills/pdf-to-markdown/scripts/pdf_to_markdown.py INPUT_DIR -O OUTPUT_DIR --glob "*.pdf"`

**Notes**
- The script emits a simple, readable Markdown transcript. It does not reliably infer headings from PDF typography.
- If image extraction is requested:
  - Add `--extract-images --images-dir IMAGES_DIR`.

### 4) OCR fallback for scanned PDFs

If there’s no embedded text layer, do OCR first, then convert.

- Suggested approach (if tooling is available):
  - `ocrmypdf --skip-text --deskew --clean INPUT.pdf OCR.pdf`
  - Then convert `OCR.pdf` via step 2 or 3

If OCR tooling is not installed, ask the user if you should install it (or have them run it locally), because OCR setup varies by OS.

## Output expectations

- Produce one `.md` per PDF.
- Use **relative** paths for any extracted images.
- Keep output deterministic: same input → same output ordering.

## Troubleshooting

- **Empty output**: likely scanned PDF → use OCR fallback
- **Weird line breaks**: prefer pandoc, or post-process by merging wrapped lines
- **Tables look bad**: PDFs don’t encode tables consistently; keep them as plain text unless user requests manual cleanup

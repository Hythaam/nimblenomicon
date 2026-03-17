#!/usr/bin/env python3

from __future__ import annotations

import argparse
import glob
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


def _eprint(*args: object) -> None:
    print(*args, file=os.sys.stderr)


@dataclass(frozen=True)
class ConvertOptions:
    output_file: Path | None
    output_dir: Path | None
    glob_pattern: str
    extract_images: bool
    images_dir: Path | None
    page_separator: str


SMALL_HEADING_WORDS = {
    "a",
    "an",
    "and",
    "as",
    "at",
    "be",
    "but",
    "by",
    "for",
    "from",
    "in",
    "of",
    "on",
    "or",
    "the",
    "to",
    "up",
    "vs",
    "with",
}


def _iter_pdfs(input_path: Path, glob_pattern: str) -> Iterable[Path]:
    if input_path.is_file():
        if input_path.suffix.lower() != ".pdf":
            raise ValueError(f"Input file must be a .pdf: {input_path}")
        yield input_path
        return

    if input_path.is_dir():
        pattern = str(input_path / glob_pattern)
        for match in sorted(glob.glob(pattern)):
            path = Path(match)
            if path.is_file() and path.suffix.lower() == ".pdf":
                yield path
        return

    raise FileNotFoundError(str(input_path))


def _safe_rel_image_link(from_md: Path, image_path: Path) -> str:
    try:
        rel = image_path.relative_to(from_md.parent)
        return rel.as_posix()
    except Exception:
        return image_path.as_posix()


def _is_caps_word(word: str) -> bool:
    cleaned = re.sub(r"[^A-Za-z&/+]+", "", word)
    return bool(cleaned) and cleaned.upper() == cleaned


def _is_all_caps_heading(line: str) -> bool:
    words = [word for word in line.split() if word]
    if not words or len(words) > 5:
        return False

    alpha_words = [word for word in words if re.search(r"[A-Za-z]", word)]
    if not alpha_words:
        return False

    return all(_is_caps_word(word) for word in alpha_words)


def _is_title_heading(line: str) -> bool:
    if not (1 <= len(line) <= 40):
        return False

    if line.endswith((".", ",", ";", ":")) or line.startswith(("#", "-", "*")):
        return False

    words = [word for word in line.split() if word]
    if not (1 <= len(words) <= 6):
        return False

    score = 0
    for word in words:
        bare = re.sub(r"[^A-Za-z0-9/&+'\-]+", "", word)
        if not bare:
            continue
        lower = bare.lower()
        if bare.isupper() or bare[0].isdigit() or bare[0].isupper() or lower in SMALL_HEADING_WORDS:
            score += 1

    return score == len(words)


def _clean_toc_line(line: str) -> str | None:
    if "�" not in line and "..." not in line:
        return None

    candidate = re.sub(r"[\x00-\x1f]", "", line)
    candidate = re.sub(r"[�.]{3,}", " ", candidate)
    candidate = re.sub(r"\s+", " ", candidate).strip()
    match = re.match(r"^(.*?)(\d+)$", candidate)
    if not match:
        return None

    title = match.group(1).strip(" -.")
    page = match.group(2)
    if not title:
        return None

    if title.isupper():
        title = title.title()

    return f"- {title} (p. {page})"


def _cleanup_markdown_text(md_text: str) -> str:
    text = (
        md_text.replace("\u00ad", "")
        .replace("\u200b", "")
        .replace("\ufeff", "")
        .replace("\x08", "")
        .replace("“", '"')
        .replace("”", '"')
        .replace("’", "'")
        .replace("–", "-")
        .replace("—", "--")
    )

    raw_lines = [line.strip() for line in text.splitlines()]
    normalized: list[str] = []
    inserted_toc_heading = False

    index = 0
    while index < len(raw_lines):
        line = raw_lines[index]

        if not line:
            normalized.append("")
            index += 1
            continue

        if re.fullmatch(r"\d+", line) or line == "---" or line.startswith("ARTIST:"):
            index += 1
            continue

        toc_line = _clean_toc_line(line)
        if toc_line is not None:
            if not inserted_toc_heading:
                normalized.extend(["## Table of Contents", ""])
                inserted_toc_heading = True
            normalized.append(toc_line)
            index += 1
            continue

        if _is_all_caps_heading(line):
            parts = [line.title() if line.isupper() else line]
            next_index = index + 1
            while next_index < len(raw_lines):
                candidate = raw_lines[next_index]
                if not candidate or not _is_all_caps_heading(candidate):
                    break
                parts.append(candidate.title() if candidate.isupper() else candidate)
                next_index += 1

            normalized.extend([f"## {' '.join(parts)}", ""])
            index = next_index
            continue

        if _is_title_heading(line):
            normalized.extend([f"### {line}", ""])
            index += 1
            continue

        line = re.sub(r"^\*\s*", "- ", line)
        line = re.sub(r"^•\s*", "- ", line)
        normalized.append(line)
        index += 1

    collapsed: list[str] = []
    for line in normalized:
        if line == "" and collapsed and collapsed[-1] == "":
            continue
        collapsed.append(line)

    out: list[str] = []
    paragraph = ""
    in_bullet = False
    for line in collapsed:
        if not line:
            if paragraph:
                out.append(paragraph)
                paragraph = ""
                in_bullet = False
            if out and out[-1] != "":
                out.append("")
            continue

        if line.startswith("#"):
            if paragraph:
                out.append(paragraph)
                paragraph = ""
                in_bullet = False
            if out and out[-1] != "":
                out.append("")
            out.extend([line, ""])
            continue

        if line.startswith("- "):
            if paragraph:
                out.append(paragraph)
                paragraph = ""
            out.append(line)
            in_bullet = True
            continue

        if in_bullet and out and out[-1].startswith("- "):
            previous = out[-1]
            if previous.endswith("-") and re.search(r"[A-Za-z]-$", previous):
                out[-1] = previous[:-1] + line
            else:
                out[-1] = previous + " " + line
            continue

        if not paragraph:
            paragraph = line
            continue

        if paragraph.endswith("-") and re.search(r"[A-Za-z]-$", paragraph):
            paragraph = paragraph[:-1] + line
        else:
            paragraph += " " + line

    if paragraph:
        out.append(paragraph)

    final_lines: list[str] = []
    for line in out:
        if line.startswith(("#", "- ")) or not line:
            final_lines.append(line)
            continue

        final_lines.append(
            re.sub(r"^([A-Z][A-Za-z0-9/&+'\-\" ]{1,35}\.)\s+", r"**\1** ", line)
        )

    result: list[str] = []
    for line in final_lines:
        if line == "" and (not result or result[-1] == ""):
            continue
        result.append(line)

    cleaned = "\n".join(result).strip() + "\n"
    cleaned = re.sub(r"^(###+?\s+.+?)\s+Artist:\s+.+$", r"\1", cleaned, flags=re.MULTILINE)
    return cleaned


def _extract_images(doc, pdf_path: Path, md_output_path: Path, images_dir: Path) -> list[str]:
    """Extract images and return markdown lines to append near end of file."""

    images_dir.mkdir(parents=True, exist_ok=True)
    emitted: list[str] = []

    # Import locally so script still prints a friendly error if dependency missing.
    import fitz  # type: ignore

    for page_index in range(doc.page_count):
        page = doc.load_page(page_index)
        image_list = page.get_images(full=True)
        for image_index, img in enumerate(image_list, start=1):
            xref = img[0]
            try:
                extracted = doc.extract_image(xref)
            except Exception:
                continue

            ext = extracted.get("ext", "png")
            image_bytes = extracted.get("image")
            if not image_bytes:
                continue

            image_name = f"{pdf_path.stem}.p{page_index+1}.img{image_index}.{ext}"
            out_path = images_dir / image_name
            if not out_path.exists():
                out_path.write_bytes(image_bytes)

            link = _safe_rel_image_link(md_output_path, out_path)
            emitted.append(f"![]({link})")

    if emitted:
        emitted.insert(0, "")
        emitted.insert(0, "## Extracted Images")

    return emitted


def _pdf_to_markdown_text(pdf_path: Path, options: ConvertOptions) -> str:
    try:
        import fitz  # type: ignore
    except Exception:
        raise RuntimeError(
            "PyMuPDF is required. Install with: python -m pip install -r "
            ".github/skills/pdf-to-markdown/scripts/requirements.txt"
        )

    doc = fitz.open(str(pdf_path))

    parts: list[str] = []
    parts.append(f"# {pdf_path.stem}")
    parts.append("")

    any_text = False
    for page_index in range(doc.page_count):
        page = doc.load_page(page_index)
        text = page.get_text("text")
        if text and text.strip():
            any_text = True
        # Normalize Windows newlines and trim trailing whitespace noise.
        text = text.replace("\r\n", "\n").rstrip()

        parts.append(text)

        if page_index != doc.page_count - 1:
            parts.append(options.page_separator)

    # Optional image extraction.
    if options.extract_images:
        if options.images_dir is None:
            raise ValueError("--images-dir is required when --extract-images is set")

        md_output_path = options.output_file
        if md_output_path is None and options.output_dir is not None:
            md_output_path = options.output_dir / f"{pdf_path.stem}.md"
        if md_output_path is None:
            md_output_path = pdf_path.with_suffix(".md")

        parts.extend(_extract_images(doc, pdf_path, md_output_path, options.images_dir))

    doc.close()

    out = "\n".join(parts).strip() + "\n"
    out = _cleanup_markdown_text(out)

    if not any_text:
        out = (
            out
            + "\n"
            + "---\n"
            + "\n"
            + "**Note:** No embedded text was detected in this PDF. It may be scanned. "
            + "Consider OCR (e.g., ocrmypdf) and re-run conversion.\n"
        )

    return out


def _write_output(md_text: str, pdf_path: Path, options: ConvertOptions) -> Path:
    if options.output_file is not None:
        out_path = options.output_file
    elif options.output_dir is not None:
        out_path = options.output_dir / f"{pdf_path.stem}.md"
    else:
        out_path = pdf_path.with_suffix(".md")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(md_text, encoding="utf-8")
    return out_path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Convert PDF(s) to Markdown using PyMuPDF (text extraction + optional images)."
    )
    parser.add_argument(
        "input",
        type=Path,
        help="Path to a PDF file or a directory containing PDFs.",
    )
    parser.add_argument(
        "-o",
        "--output",
        dest="output_file",
        type=Path,
        default=None,
        help="Output markdown file path (single input PDF only).",
    )
    parser.add_argument(
        "-O",
        "--output-dir",
        dest="output_dir",
        type=Path,
        default=None,
        help="Output directory (for directory input or to force per-PDF outputs).",
    )
    parser.add_argument(
        "--glob",
        dest="glob_pattern",
        default="*.pdf",
        help="Glob to match PDFs when input is a directory (default: *.pdf).",
    )
    parser.add_argument(
        "--extract-images",
        action="store_true",
        help="Extract embedded images and append links to the end of the markdown.",
    )
    parser.add_argument(
        "--images-dir",
        type=Path,
        default=None,
        help="Directory to write extracted images into (required with --extract-images).",
    )
    parser.add_argument(
        "--page-separator",
        default="\n\n---\n\n",
        help='Text inserted between pages (default: "---").',
    )

    args = parser.parse_args()

    if args.output_file is not None and args.input.is_dir():
        parser.error("--output is only valid when input is a single PDF")

    if args.output_file is not None and args.output_dir is not None:
        parser.error("Use either --output or --output-dir, not both")

    options = ConvertOptions(
        output_file=args.output_file,
        output_dir=args.output_dir,
        glob_pattern=args.glob_pattern,
        extract_images=bool(args.extract_images),
        images_dir=args.images_dir,
        page_separator=args.page_separator,
    )

    try:
        pdfs = list(_iter_pdfs(args.input, options.glob_pattern))
    except Exception as e:
        _eprint(f"Error: {e}")
        return 2

    if not pdfs:
        _eprint("No PDFs found.")
        return 2

    if options.output_file is not None and len(pdfs) != 1:
        _eprint("--output can only be used for a single PDF.")
        return 2

    for pdf_path in pdfs:
        try:
            md_text = _pdf_to_markdown_text(pdf_path, options)
            out_path = _write_output(md_text, pdf_path, options)
            print(out_path)
        except Exception as e:
            _eprint(f"Failed: {pdf_path}: {e}")
            return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

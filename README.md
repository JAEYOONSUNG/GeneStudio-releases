# Gene Studio

A plasmid workbench that runs in one file — circular and linear maps, an
annotated sequence view, restriction digests with a simulated agarose gel, PCR,
cloning, Golden Gate assembly, guide RNA design and Sanger `.ab1` review — by
**Jae-Yoon Sung**.

This repository holds **only the released builds and the version feed**. The
source is not here and is not public: Gene Studio is given to named people for
research, and copying, changing or redistributing it needs written permission.
The terms are in [`LICENSE`](LICENSE), and the same text ships inside the
application.

**[What Gene Studio is, with pictures →](https://jaeyoonsung.github.io/GeneStudio-releases/)**
&nbsp;·&nbsp; **[Download the latest build →](../../releases/latest)**

The application opens on a licence window showing a **Machine ID**. Send it to
**genestudio.help@gmail.com** and paste back the licence you are given; it runs
on that computer and nowhere else. The window composes that mail for you — fill
in your name and institution and it fills in the rest.

*macOS*: open the .dmg and drag Gene Studio to Applications. It is signed with a
Developer ID and notarized by Apple, so it opens on a double-click.
*Windows*: run the setup .exe; if SmartScreen appears, choose **More info → Run
anyway**.

Every picture below is the demonstration construct that ships with the app.

---

### The map

Double-stranded, both topologies, features packed per strand — top-strand
outside the pair and bottom-strand inside. A name that fits its arc is written
on the arc; the rest go to a margin column whose leaders fade where they cross
the loci. Enzyme sites are ticks through the backbone, and hovering a name
lights every cut that enzyme makes.

![The circular map](screenshots/map.png)

### The sequence

Loci and their cut marks above the line, forward primers next, then both
strands, then each translation drawn **under the residues it belongs to**, and
reverse primers below the strand they run backwards along. A restriction cut is
a stepped `ㄴㄱ` through both strands, so which strand breaks where — and which
way the overhang points — is read off the bases rather than inferred from the
enzyme's name.

![The sequence view](screenshots/seq.png)

### The linear map

The same molecule unrolled, with its own layer switches: what has to go to make
a ring legible is not what has to go for a row.

![The linear map](screenshots/lin.png)

### Digests, on a gel

A real gel's shape: even lanes on a dark slab, the ladder in lane 1, the uncut
control in lane 2. A band's size is on hover, the way a gel is read against its
ladder. Blocked cuts are named under the gel — methylation is checked against
the strain the DNA was grown in, not assumed.

![The digest and gel](screenshots/dig.png)

### The feature table

Every field the record carries, a column per qualifier, ordered the way GenBank
writes them — so nothing in the file is quietly dropped by a table with a fixed
set of columns. *Full + computed* adds what is in no GenBank: %GC, mass, pI,
GRAVY and the ribosome binding site with its spacer and score.

![The feature table](screenshots/ft.png)

### Primers and PCR

The construct's own primers, the lab's freezer stock and the universal set are
three layers with three switches. A primer is matched by its **3′ end**, since
that is the end a polymerase extends from — a 5′ overhang matches nothing and is
measured rather than required, and a designed mismatch inside the annealing is
the point of a mutagenic primer rather than a failure to bind.

![Primers and PCR](screenshots/pcr.png)

### Guide RNAs and deletion arms

Ported from the author's own PrimerDesigner: guide scoring, Golden Gate oligos,
Gibson inverse-PCR primers and four-primer deletion arms, with the nuclease
table and thresholds copied rather than reinvented.

![Guides](screenshots/cr.png)

### Cloning

A region of one construct into another: two parents, a region picked on each by
pointing at it, the primers that do the job and the construct that comes out —
side by side, recomputed on every change.

![Cloning](screenshots/clone.png)

### Golden Gate assembly

![Assembly](screenshots/gg.png)

### Sanger reads

A pileup in the construct's own coordinates, each read's chromatogram drawn in
the same columns directly beneath its bases. A read with an indel is aligned
with a gap rather than reported as a wall of mismatches, and a difference is
judged on the neighbourhood's quality — the end of a Sanger read decays, and a
dozen disagreements in a row there is not a dozen variants.

![Sanger review](screenshots/san.png)

### Figures

Every drawing is SVG — paths and text, not pixels — and exports as vector with
the stylesheet resolved, editable in Illustrator.

![Figure settings](screenshots/figures.png)

---

## Licence

**Copyright © 2026 Jae-Yoon Sung. All rights reserved.**

Gene Studio is **not open source**. The builds published here are covered by the
[Gene Studio Research Use Licence](LICENSE) — the same terms that ship inside the
application. In short:

- Install and run it on the computer your licence key names, for research,
  teaching and study, including work you publish. Your data, your constructs and
  your findings stay yours.
- **Do not modify it, and do not build anything out of it.** That covers a
  modified build, a repackaged installer, and any other program containing part
  of this one. Taking it apart to obtain the source — decompiling,
  disassembling, unpacking the bundle — is not permitted either, nor is removing
  or altering the licence check, the copyright notices or the attributions.
- Do not pass on the installer, the application or a licence key; do not sell,
  rent or host it as a service, or put it inside a commercial product.
- For research use, ask: the answer is usually yes. Written permission means an
  email from the author saying so — **genestudio.help@gmail.com**.

Authorship and every right in Gene Studio remain with Jae-Yoon Sung. Nothing in
this repository is offered under an open-source licence, and no permission
beyond `LICENSE` is granted by the builds being publicly downloadable. The
third-party components listed below keep their own terms and are not restricted
by it.

---

The restriction-enzyme data is **REBASE**'s (Roberts, Vincze, Posfai & Macelis,
*Nucleic Acids Research*, rebase.neb.com) and should be cited as theirs. MAFFT,
SeqFold and Aioli run locally under their own licences; full notices ship with
the application. The `.dna` reader was worked out from the bytes of real files
for interoperability — Gene Studio contains no SnapGene code and is not
connected with, or endorsed by, SnapGene or Dotmatics.

<!-- gene-studio:release-notes:begin -->
## Release notes

Version-specific changes are retained below. Earlier releases: [GitHub Releases](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases).

<!-- gene-studio:release:1.3.88:begin published-at=2026-09-19T20:42:51.000Z -->
### [1.3.88](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.88) — 2026-09-19

- Narrow the codon table's tRNA copy bars to the width of the RSCU value beside them: a gene copy count is a small integer, and its track had been the widest column in the figure. The bars are also thinner, so each row reads as a count rather than as a progress bar, and the card around the table now fits the table instead of leaving empty space beside the legend. The freed width goes to the RBS and amino-acid panels, which lay their residues out in three columns.
- Put the website's workbench frame back around the whole step it marks, centred on the instrument it names, and run the connecting line through the mounts again so the strip reads as one sequence rather than six separate dashes.
<!-- gene-studio:release:1.3.88:end -->

<!-- gene-studio:release:1.3.87:begin published-at=2026-09-19T13:35:02.000Z -->
### [1.3.87](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.87) — 2026-09-19

- Draw the strain Details tab instead of listing it: the codon table carries frequency bars and RSCU deviation bars centred on 1.0, the RBS section shows the SD consensus paired base by base with the 16S anti-SD tail, a spacer distribution with its mean, and the matched motifs compared with the consensus position by position, and a tRNA gene supply chart sets tRNA gene copies and anticodon variety beside residue share. Annotated promoters and terminators show length bars with strand direction.
- Shorten the R–M overview cards: recognition motif cells are smaller and the modification chemistry (6mA, 5mC, 4mC) is named beside the motif text with its modified base and strand, instead of being printed inside each marked cell.
- Simplify the website workbench drawings: connectors stop short of the instrument mounts, share a quieter neutral hue, and keyboard focus underlines the step label. The inspected step sits in one closed frame with even room around its label, and the note under the strip ends in a "See how" link into that step's section.
- Set the whole website in one typeface: file extensions, the release number, step counters and the format tray's eyebrow no longer switch to a monospace face, and the page checks refuse any text that does.
<!-- gene-studio:release:1.3.87:end -->

<!-- gene-studio:release:1.3.86:begin published-at=2026-09-18T07:13:21.000Z -->
### [1.3.86](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.86) — 2026-09-18

- Replace alternating R–M set color bars with subtle block backgrounds: violet for M-only systems and modification subunits, sage green for specificity subunits, and soft orange for restriction subunits. Apply the same role colors to linked loci and expanded annotations in light and dark themes; keep mixed systems neutral and activity states separate.
- Refine the website's Files section with compact format selectors, smoothly moving and expanding previews, and expandable descriptions. Match the workbench background to the light theme and remove the center dots from the SnapGene and local-file illustrations.
<!-- gene-studio:release:1.3.86:end -->

<!-- gene-studio:release:1.3.85:begin published-at=2026-09-18T02:11:39.000Z -->
### [1.3.85](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.85) — 2026-09-18

- Compare GenBank `locus_tag` annotations with REBASE intervals and REBASE-reported GenBank overlaps, preserving each source's assembly version, strand and protein identifiers.
- Distinguish R–M sets and show protein signature positions with their loci in summaries, with detailed comparisons and discovery evidence available in expandable sections.
- Open recorded UniProt or NCBI protein entries directly beside linked loci. When exact accessions are unavailable, expanded details provide clearly labeled searches.
- Explicitly search the matching analyzed genome for recognition sites within a size limit, including both strands and circular boundaries. Keep protein residue coordinates (aa) separate from DNA coordinates (bp).
- Refine website file-format icons and connected workbench frames with coordinated colors, smaller corners, and guidance that follows pointer and keyboard focus.
- Smooth website media transitions by retaining the current view until its replacement is ready and rolling walkthrough steps in the correct vertical direction. Respect reduced motion and pause playback offscreen or in hidden tabs.
<!-- gene-studio:release:1.3.85:end -->

<!-- gene-studio:release:1.3.84:begin published-at=2026-09-17T13:15:52.000Z -->
### [1.3.84](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.84) — 2026-09-17

- Replace vector suitability heuristics with a strain-bound design audit: supported checks earn completeness points while unknown evidence stays in the denominator. Keep identified conflicts separate from the score, and never present it as transformation or expression success probability.
- Evaluate each annotated CDS against the selected strain's saved codon and 16S anti-SD evidence. Read actual DNA with its strand, joined/circular coordinates, phase and genetic code; expose partial, ambiguous, unsupported and exceptional annotations, missing reference families and internal stops instead of using a generic host or stored protein text as proof.
- Carry source methylation, target R-M and modification-dependent defense uncertainty into the vector audit. Review replication/integration/transient intent, target selection, delivery, regulation and verification with explicit researcher evidence that requires reconfirmation after the construct or host context changes.
- Show compact R-M system summaries with activity, recognition motif and linked genome loci together. Expand system details and individual M/R/S/C annotation rows when needed, with source provenance and genome navigation preserved.
- Keep the application version in the top bar and remove its build date and time.
<!-- gene-studio:release:1.3.84:end -->

<!-- gene-studio:release:1.3.83:begin published-at=2026-09-17T10:26:23.000Z -->
### [1.3.83](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.83) — 2026-09-17

- Show R-M M/R/S/C genome loci in collapsed cards and annotation pickers, preserving joined, circular, partial and remote locations. Open a source-verified locus map, copy its coordinates and provenance, and return to the same strain draft without losing unsaved edits.
- Assess predicted target-DNA methylation for guide candidates on both physical DNA strands, including motifs crossing PAM and circular-genome boundaries. Separate possible interference, unresolved overlap, limited-context tolerance and incomplete coverage; apply literature rules only to compatible, explicitly identified Cas enzymes and retain guide scores.
- Remember explicit methylation-profile choices for each exact target genome. Recheck results when the target, annotation, profile, definition or Cas evidence changes, and preserve the selected occurrence and locus for repeated spacers or overlapping annotations.
- Search every library candidate by gene, locus, coordinates, spacer, PAM or methylation system. Review evidence in bounded pages, compare scores and spacer-match counts, select candidates beyond the table display limit, and return from base inspection to the same review and keyboard focus.
- Retain assessment provenance in copied tables, oligo orders, added guide features and completed vectors. Connect workbook status, evidence and deduplicated order rows with stable design IDs, and include a review-summary sheet with target, Cas and interpretation context.
<!-- gene-studio:release:1.3.83:end -->

<!-- gene-studio:release:1.3.82:begin published-at=2026-09-17T04:15:21.000Z -->
### [1.3.82](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.82) — 2026-09-17

- Make SignalP settings, installation instructions and pipeline status readable across narrow windows, with independent options for versions 5 and 6, reliable setup rechecks and clear numeric validation.
- Keep running SignalP settings fixed, cancel when closing, ignore late results and reject failed or interrupted runs. Save the generated prediction tables, mature-chain FASTA and plots from the results dialog.
- Add M/R/S/C subunit annotation links to strain R–M systems, including editing, save/reload and profile export. Keep annotation evidence separate from M/R activity and identify inherited reference-genome evidence explicitly.
- Open the exact linked genome feature after checking its accession, contig, locus, coordinates and source signature, including large genomes and multi-contig records. Recognize explicitly annotated specificity and controller proteins without inventing fused enzyme roles.
- Correct close-button alignment and touch targets across dialogs, preserve PGAP drafts during setup checks, and improve keyboard focus, error recovery and full external-tool listings.
<!-- gene-studio:release:1.3.82:end -->

<!-- gene-studio:release:1.3.81:begin published-at=2026-09-16T21:00:56.000Z -->
### [1.3.81](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.81) — 2026-09-16

- Separate actual recognition patterns from notes and annotation evidence in strain R–M details, with explicit modification and restriction activity labels.
- Open a saved strain's R–M editor directly, or duplicate a built-in strain to edit its copy. The editor explains which record changes require **Save changes**.
- Save display preferences for notes, annotation evidence, uncertain details and compact row spacing.
<!-- gene-studio:release:1.3.81:end -->
<!-- gene-studio:release-notes:end -->

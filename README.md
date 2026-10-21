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

**[What Gene Studio is, with pictures →](https://genestudio.app/)**
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

<!-- gene-studio:release:1.1.50.1:begin published-at=2026-10-21T00:31:15.000Z -->
### [1.1.50.1](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.1.50.1) — 2026-10-21

Gene Studio 1.1.50.1 brings Sanger review that shows deletions, insertions and junctions on the read map, and reads much more of what SnapGene keeps in a `.dna`, including its history of how a construct was made.

- **Sanger traces**: the whole read scrolls sideways with the wheel or a drag, at Compact, Standard or Wide spacing, and peak heights are scaled to the signal nearby. The trace keeps its place when the view is rebuilt.
- **Sanger structure**: a deletion is cut into its read on the map, an insertion is marked, and a read that matches at the start and then carries something else is drawn that way. Every matching stretch is found, short ones included, on both strands. Indels in a region that only loosely matches the construct are marked as unconfirmed. On a genome the map zooms to where the reads are.
- **SnapGene colours and notes**: colours set with Set DNA Color are read, drawn and written back. The organism, the strain a construct was transformed into, natural or synthetic, DNA ends, citation details, primer descriptions and colours, and hidden features and primers come through. Multi-value qualifiers (db_xref, GO terms, notes), `transl_except` and collection dates are no longer lost.
- **SnapGene history**: the History view shows how a construct was made in SnapGene — each edit and cloning step with what went into it — and any earlier version opens as its own tab.
- **Segment colours**: a feature coloured piece by piece in SnapGene (for example a mutated codon inside a gene) is drawn piece by piece on the map, the linear view and the sequence.
- **Digest from a selection**: select a stretch and open Digest to see the enzymes that cut only inside it and the pairs that cut it out, with fragment size and whether the remaining ends rejoin. Isoschizomers are grouped only when they cut alike, methylation included.
- **Hiding features**: right-click a feature on the map to hide it, the selected features, or every feature of its type. The Features panel lists what is hidden, with Show and Show all. Hiding can be undone and is kept in GenBank and `.dna` files.
<!-- gene-studio:release:1.1.50.1:end -->

<!-- gene-studio:release:1.1.50:begin published-at=2026-10-18T13:15:10.000Z -->
### [1.1.50](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.1.50) — 2026-10-18

Gene Studio 1.1.50 gathers every earlier build into one release. From here on, updates are numbered 1.1.50.1, 1.1.50.2 and so on. Copies on a 1.4.x build cannot update to it by themselves: download it once from this page, and later updates install themselves.

- **Maps**: circular and linear maps of double- and single-stranded molecules. Features are packed per strand, names are placed on the arc or in margin columns with curved or straight leader lines, and crowded poles stack outward. A cut tick shows the end it leaves. Primers are drawn as arrows with their 5′ tails. Hover cards cover features, primers and cuts. Selections can be measured as arcs and read as the two fragments they make. A multiline centre title is optional, and cut-site shortcuts cover All, Unique, Double and 3+ cutters.
- **Sequence view**: both strands with gggenes-style feature arrows, translations under their codons, primers above and below, and stepped cuts through both strands. Includes a whole-molecule navigator, ⌘A select-all with copy, a copy button on each bottom readout value, and a Find similar comparison that aligns a query through insertions and deletions against the reference.
- **Find and go to**: DNA (IUPAC and regular expressions, widening to near matches), protein over translated regions, any feature field, and Go to a base or range. Searches start from the current selection or reading position, and the last searches are a key away.
- **Digests and gel**: 1,113 REBASE enzymes with the Commercial set as default, and Dam/Dcm/EcoKI methylation checked against the host strain. The simulated agarose gel shows ladders, tracking dyes (including NEB purple and Orange G) and a bigger plate. Suggest digests is included.
- **Feature table**: every qualifier as a column in GenBank order, plus computed %GC, mass, pI, GRAVY and RBS scoring. Columns can be pinned. CDS cards show the protein, accessions and qualifiers.
- **Primers and PCR**: matching by the 3′ seed, with the lab freezer workbook (any layout via Columns…), stock box and well locations, an Exact matches only filter, and two-row PCR size readouts. ⌘R opens a primer from a selection or search hit, and ⌘D opens a PCR fragment or selected DNA as a new linear construct with annotations kept.
- **Cloning and assembly**: restriction and Gibson cloning, Golden Gate with domestication and warnings for internal sites, and Join parts with PCR primer design for Gibson/HiFi and Golden Gate.
- **Guide RNAs**: guide scoring and ranked candidates at alternative positions, Golden Gate oligos, Gibson inverse-PCR and four-primer deletion arms. Methylation of the target DNA is assessed per strain, and Guide design opens straight from a selected CDS.
- **Sanger**: `.ab1`/`.abi` traces (including `.gz`) shown as a pileup in construct coordinates, with chromatograms under their bases, gapped alignment of indels and quality-aware calls. A live traces folder follows Finder renames, and the library shows Cards or Details.
- **Align and trees**: ggmsa-style alignments with figure export and sequence logos, plus per-column inspection and local sequence analyses. IQ-TREE 3 with ModelFinder, UFBoot and SH-aLRT, ancestral states, and a Tree studio with layouts, presets, heatmap layers, symbols and clade backgrounds.
- **Homology and analyses**: NCBI and UniProt BLAST, HMMER, Pfam, CD-Search, Foldseek, HHpred and AlphaFold Server handoffs, with retrieval of hit sequences. SignalP 5 and 6, InterProScan, eggNOG, DefenseFinder and Prodigal pipelines run with visible progress.
- **Strain DB**: 54 built-in strains from 50 NCBI reference genomes. Each has codon, tRNA and RBS evidence, plus restriction–modification systems with linked M/R/S/C loci, catalytic and cofactor motifs measured against predicted structures, Type I half-site reading, and REBASE strain and locus comparison. The profile list stays on screen while the import column changes.
- **DNMB**: imports DNMBsuite result folders and runs modules in an isolated Docker container. Prepare fetches each module's databases once. Connected reports survive updates and can be detached, and 17 bundled reports are drawn as responsive panels from their chart data.
- **Files and Home**: GenBank, FASTA, SnapGene `.dna` (methylation flags kept), ApE, xlsx and Sanger formats, detected by content rather than file extension. Save As makes a copy in a new tab. Home has starred files, full recent history, last-viewed dates and sorting, a single clear button in search, and reorderable file tabs.
- **Window and platforms**: view tabs span the window above the sidebar, with a dark theme, drawn menus throughout and Escape closing the open dialog. macOS document icons and a branded installer are included. Builds are Windows Setup and portable, Linux AppImage and `.deb` with MIME types, and a web viewer and iPhone home-screen app.
- **Licence and updates**: an offline machine-bound licence that renews or is revoked by itself, with a request form. Licences verify against a second author key. The Mac build is signed and notarized. One-press updates download, install and restart on macOS, Windows and AppImage.
<!-- gene-studio:release:1.1.50:end -->
<!-- gene-studio:release-notes:end -->

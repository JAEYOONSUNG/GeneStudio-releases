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

<!-- gene-studio:release:1.3.98:begin published-at=2026-09-22T08:09:06.000Z -->
### [1.3.98](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.98) — 2026-09-22

- Drag the ring and the reading stays. The length of the arc you dragged was written into the map's panel while the mouse was down and wiped the moment you let go — the map redraws on release, and that rebuilds the panel — so the number vanished at exactly the moment you stopped to read it. The two other things this panel reports, a measurement in progress and a picked cut, were both rebuilt; a settled selection was the one that was not.
- And a selection on a circle is two fragments. Choosing a stretch of a plasmid decides both pieces you would get if you cut at its ends, and the panel named only the piece under the pointer: it reads `80 → 778 · 698 bp · rest 2,252 bp` now, and the two add up to the molecule. A linear molecule has three pieces, not two, so it says how much lies before the selection and how much after rather than pretending its ends are joined.
<!-- gene-studio:release:1.3.98:end -->

<!-- gene-studio:release:1.3.97:begin published-at=2026-09-22T06:58:57.000Z -->
### [1.3.97](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.97) — 2026-09-22

- A cut tick shows the end it leaves. Every cut was the same perpendicular line, so a drawing that knows each enzyme's top and bottom offsets was throwing away the one thing that varies across them: on the bundled construct's 159 sites, 106 leave a blunt end, 29 a 5' overhang and 24 a 3' one. The tick is the duplex's own break now — the top-strand cut owns the outer half of the span and the bottom-strand cut the inner half, each at its own angle, leaning one way for a 5' overhang and the other for a 3'. It is drawn to scale and only where the scale can be seen: below 2.5 px of arc the halves stay collinear, because a stagger floored to a visible size would be the drawing inventing a magnitude. A blunt cut is emitted as the single segment it always was. What the old width hierarchy promised is not what it delivered — 157 of those 159 ticks are the same 1.6 px at full opacity, since almost every enzyme that cuts a plasmid cuts it once — and that channel is left alone rather than polished.
- Hovering a cut says which cut it is. It reported nothing at all: not the enzyme, not the position, while the methylation cross beside it and the primer arrowhead both answered. On that same construct only 19 of 171 margin labels are placed, so for 152 marks there was no way to find out. Each tick carries its enzyme, recognition site, cut position and exact overhang, up to the point where the ring is drawing more ticks than anyone hovers.
- A primer on the ring is an arrow again, and its 5' tail is on the map. The head was 2.6 times the width of the shaft it ended — measured at fit, a 3.9 x 4.3 px head on a 2.7 x 1.6 px stroke — which is not an arrow but a blob with a stub, and it crashed into the feature band beside it. It is 1.6 times the shaft now, never more than a third of the primer's own arc. And the part that does not anneal was not drawn at all: a 44-mer whose first 20 bases are a Gibson arm was the same picture as a plain 24-mer. The tail continues off the 5' end as a dashed line with no head, because a tail has no 3' end to point with.
- The vector audit tells a conflict from a question. One number stood for two situations — "analysis found a conflict in your construct" and "nobody has answered the questions yet" — and they are not the same news. The head reads three counts instead: conflicts to resolve, checks still unanswered, checks supported, each saying where its number came from, since a researcher can record a conflict and a recorded judgement must never be presented as a measurement. What the audit actually found now sits on each check's face rather than behind a chevron: the origins it counted and their names, the marker candidates, the CDS it could compare against the target's codon table and their fit, the anti-SD it derived and how many starts matched it. The status word splits too — "Unanswered" is a researcher's call outstanding, "Unknown" is something the software could not establish — and every outstanding question is answerable where it is asked.
- The view tabs and the map's mark and label tiles answer the pointer. A tab's wash filled all 43 px with square corners flush to the rule and its underline ran the full width including the padding, so a selected view read as a rectangle somebody had coloured in; it keeps its own rounded corners and the mark under it is inset to the label it belongs to. The map's eye and Aa tiles changed only a border colour on hover, which on a 34 x 26 square is a change you have to look for: they take the press instead. Neither applies hover on a touch screen, where the state would stick after the tap.
- Where the ring runs out of pixels, it says so. A crowded MCS drew nine cut marks in the space of four, and the drawing did not admit it — every other limit on this map does: the ring's centre carries `96 of 8,338 features`, the layer panel carries how many margin names it could place. This one is not a cap anyone could lift; it is the ring running out of room, so a run of cuts too close to be told apart is drawn as the band of duplex it occupies, filled and outlined, with a rail at each end sitting on a real cut. The fill says "a stretch that cannot be resolved here", the rails are two cuts you can trust. Measured on the bundled construct at fit: 101 of 156 marks are within a stroke's width of a neighbour, and 14 runs of three or more cover 59 of them. The layer panel now reads `97 of 156 cuts drawn apart · 14 clusters · zoom in`, and zooming is the whole answer — the crowded MCS separates by 8x and the ring carries no bands at all by 20x, so there is no control to add. A band names what it holds on hover, `Hide` reaches each enzyme inside it, and both rulers still snap every member to its own base.
- It is also faster. A band is one element where a cluster was a dozen, so the worst case the map allows — two thousand ticks on one ring — draws in 6.1 ms against 15.1, from 2,164 nodes to 166. A plasmid at fit went 6.43 to 5.77 ms. A genome ring is unchanged to the byte: a chromosome has almost no single cutters, so there is nothing there to cluster.
- A fence that moves when you search is not a fence. The list of marks is sorted by position, except after an exact enzyme search, which puts its own hits at the front — so anything that reads neighbours off that list was reading whatever happened to be adjacent in an array. Nothing did until now, and the clustering would have drawn a band the width of the plasmid; the order is taken rather than assumed, and a test searches and compares the fence against the quiet one.
- Each methylase gets its own card, and a mark sits on the base rather than round it. The rows in the enzyme card's methylation section were separated by seven pixels of air, so a methylase's name, its verdict chips, the two or three sites drawn out under it and the sentence explaining them all ran into the next one's. They take the shape the strain database already gives a host. And a marked position was a filled red tile with the letter knocked out to paper, which turned a CpG — two bases that are one mark — into two separate boxes with a seam down the middle, and stopped the letters reading as sequence at all. The base keeps its place and takes the mark's colour with a rule under it; the rule joins across neighbours, so a run of marked bases is one underline, which is what a run of them is. Each measured REBASE record is a card for the same reason: one record is one published experiment, and a hairline was not enough to hold a two-row duplex drawing, a percentage, a reference and a sentence about what it was tested on.
- The enzyme database opens with ⌘E. It was the one letter near this work that nothing had taken — the shortcut dispatcher answers a, f, g, p, t and z, and the desktop menu's own accelerators are the zoom keys. It is refused while a text field has the focus, because macOS binds ⌘E to *Use Selection for Find* there and that meaning is the live one.
- NEB's purple and Orange G are on the gel, and a dye front is drawn as the band it is. The simulation offered bromophenol blue and xylene cyanol; the tube most people actually load is NEB's purple, whose red band the supplier says runs with bromophenol blue — so it is BPB's own figure wearing the colour of the tube, not an invented third position, because the point of that dye is that it leaves no shadow under UV. Orange G carries the one figure its source gives, under 50 bp in either buffer, and fades out where the gel can no longer resolve it. And the guides were dashed rules, which claimed a precision the table itself disclaims: the position is approximate because the front spreads as it runs. They are soft bands now, fading to nothing on both edges, with one hairline through the middle so a size can still be read off. A front that has already run off the end keeps its dashes, since there it marks a place rather than a band.
<!-- gene-studio:release:1.3.97:end -->

<!-- gene-studio:release:1.3.96:begin published-at=2026-09-21T19:57:42.000Z -->
### [1.3.96](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.96) — 2026-09-21

- A selection on the circular map reads as the stretch it covers. The wedge's perimeter was one stroke — in from the centre, round the arc, back to the centre — so the two radii that only close the shape were drawn as heavily as the arc, and a selection came out as a hard dark triangle laid over the plasmid. What is selected is the bases, not the empty middle. The arc keeps the ink and the radii are hairlines that fade out as they approach the centre, the way the margin leaders already fade where they cross the loci; the pale sector still carries the shape. The drag preview draws the same thing, so nothing thickens when you let go.
- The page carries no raw NUL byte. Three cache keys join on a separator no class name, font or query can contain, and two of the three had it written into the file as a bare byte rather than as an escape. An HTML parser replaces U+0000 with U+FFFD before the script is compiled, so the separator the code joined on was not the one written down — harmless while nothing else used U+FFFD, and a key collision the day something did. The third site was already written correctly, which is what the other two now are.
- The macOS dmg is built in its own pass. electron-builder runs a platform's targets at the same time and cleans the shared temporary directory when it judges the build finished — which happened while the dmg was still waiting on the toolset lock with its settings file in there, so the dmg died with `ENOENT … 1.json` *after* signing and notarization had already succeeded, costing a full Apple round trip each time it appeared. Five of six one-pass builds went that way while the dmg alone and the zip alone always finished; it is a race, which is why the previous release went out on the same code an hour earlier. Each target now gets its own pass, and the zip is built last so the update manifest names the file macOS actually updates from.
- Four E. coli strains and Bacillus subtilis 168 read their own ribosome binding site. The anti-Shine–Dalgarno tail is the 3' end of the record's own 16S rRNA, and it was found by testing the product string alone — so `pre-16S ribosomal RNA maturation enzyme` and `dimethyladenosine 16S ribosomal RNA transferase`, both ordinary proteins, were read as ribosomal RNA. On B. subtilis 168 they were the only matches, because that record calls the rRNA `ribosomal RNA-16S` while the test demanded the modern `16S ribosomal RNA`: the ten real copies were skipped, the tail became the last twelve bases of a maturation enzyme, and the strain shipped with an anti-SD carrying no CCTCC at all — 15 sites across 4,536 genes, presented as a calculated result. The feature now has to be ribosomal RNA, and once it must be, the wording is read loosely enough to cover both orders. B. subtilis 168 finds 620 sites. A check refuses any built-in that calculates an RBS from a tail with no CCTCC core, and any that declines to calculate one without saying why.
- The landing page's motion is measured. Smoothness is not a matter of taste a screenshot can settle: a transition is smooth when the compositor can run it alone, and it stutters when a keyframe touches a property that forces layout. Every keyframe the page can start is now recorded and held to transform and opacity — with one documented exception, the window that must push the content below it down — and the page is driven once at desk width and once at 390 px, since the tour swaps to shorter poses on a phone. The reduced-motion path is walked too, because for a reader whose system asks for less movement it is not a fallback but the whole page, and it has to arrive complete: nothing left transparent, nothing left translated off its place.
<!-- gene-studio:release:1.3.96:end -->

<!-- gene-studio:release:1.3.95:begin published-at=2026-09-21T06:12:35.000Z -->
### [1.3.95](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.95) — 2026-09-21

- Four E. coli strains get their Dam back. A methyltransferase is recognised as the canonical one by its gene name together with its product, and the product test was written for one phrasing — so RefSeq's other one, "adenine-specific DNA-methyltransferase", was read as an ordinary annotated component. BL21(DE3) showed it worst: its Dam became an anonymous genome system, typed as though it had a restriction partner against a definition that says it has none, and the registered Dam linked to no locus at all — no coordinates, no motifs, an empty panel with the gene sitting in the same profile. TOP10/DH10B, DH5α and XL1-Blue carried the same miss. The rule now accepts both orders and the hyphen, the way the general methyltransferase rule beside it always has, and a gene called dam whose product says something else is still refused. It applies to any genome you analyse, not only the built-ins.
- A strain profile can fetch a whole strain from REBASE. The panel could search the enzyme catalogue and nothing else, so the one window that is about a strain sent you to another to fetch one — even though the organism search, the complete strain record behind it and the conversion into a profile were all already built. They are offered here now, under the enzyme search, and they are the same three calls the other window makes rather than a second copy of them.
- A strain finds its own DNMB results. Point Settings at the folder your runs are kept under, and a profile opening onto an empty reports tab looks there for itself: the match is on the assembly accession in the folder's name, with the version ignored, since a folder written for GCF_000767275.1 is the same genome as .3. A folder found this way is verified exactly as strictly as one chosen by hand, because it goes through the same import. A strain that is not in the folder passes quietly.
- The profile generator survives its own cleanup. Chrome flushes its cache directory after the process returns, so deleting the temporary profile raced it and failed with ENOTEMPTY — which the `force` flag does not cover, since that only forgives a path already gone. A full rebuild died on the seventeenth genome for this, with nothing wrong in the genome.
<!-- gene-studio:release:1.3.95:end -->

<!-- gene-studio:release:1.3.94:begin published-at=2026-09-21T02:09:11.000Z -->
### [1.3.94](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.94) — 2026-09-21

- Opening an annotated genome now offers to screen it for restriction–modification loci, where the genome is. That flow reached no R–M code at all before, so every way into it began by asking for the file a second time; a dismissible line above the drawing makes the offer instead, and nothing runs unasked. The loci it finds become candidates to curate — none of them is registered for anybody.
- A candidate row shows the catalytic catalogue beside its family signatures. The signatures say which family a locus belongs to; the catalogue is the evidence somebody deciding whether to register it is actually weighing, and it was the half that was missing. The scan runs on the peptide the analysis had already stored, so the row costs nothing new to fill.
- A registered candidate links as a subunit on its PROSITE signature alone. It had linked only when the annotation happened to name a role, so a locus found by signature was registered and then left unattached — and the motif panel told the curator to analyze the genome they had just analyzed.
- A profile that carries expression figures for a genome no longer counts as having screened it. The two are different records: the figures name the genome they were measured from and say nothing about whether its loci were ever read. Every profile shipped with the application carries both, so this changes nothing there; a profile with figures and no screen is now offered one.
- A strain profile says how to edit it, from its header. The window is a reader, and the only way into the editor was a button inside the R–M tab worded as though it concerned R–M alone — so the Overview, Details and reports tabs offered nothing, and the name at the top least of all. The door is beside Close now, on every tab, and a shipped profile carries "Built in · read-only" beside its own name rather than leaving that to be discovered by pressing the button. Editing still happens in the strain editor, where a copy is made first and where the name can be changed.
<!-- gene-studio:release:1.3.94:end -->

<!-- gene-studio:release:1.3.93:begin published-at=2026-09-20T15:47:10.000Z -->
### [1.3.93](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.93) — 2026-09-20

- Opening an R–M system's motif panel now fetches its predicted structures and measures them there and then, so the Structure column no longer reads "Not checked" until somebody finds the control under the table. That column carries the measurement the section exists for: whether a motif's residues sit close enough to another family's to be one site, and whether AlphaFold was confident where they sit. E. coli K-12's EcoKI asks for the three accessions it names, and each row comes back with its entry, its confidence and the count of motifs in one site, too far apart, or below the floor.
- Only the system that was opened is asked about. The table is built for every card on a strain's page, so a reader who scrolls past a dozen systems sends nothing; closing and reopening sends nothing either. The models are held for the session and never stored, and the button under the table becomes a way to ask again, which is the only way to retry one that failed.
- A row whose model is on its way says so, and on the web build the column says the desktop application is what fetches it. Those are three different facts that had all been the words "Not checked".
<!-- gene-studio:release:1.3.93:end -->

<!-- gene-studio:release:1.3.92:begin published-at=2026-09-20T14:46:59.000Z -->
### [1.3.92](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.92) — 2026-09-20

- Every built-in strain carries its subunits' own translations, so the R–M panel's catalytic, cofactor and P-loop motifs are given as amino-acid positions the moment it opens. The peptides are read out of each reference assembly's own annotation rather than fetched, which is why they belong to that genome's allele; 390 of 428 subunits carry one, and the remaining thirty-eight are pseudogenes that have no translation to carry. E. coli K-12's EcoKI now reads NPPF at residues 266–269 of hsdM and the Walker A and Walker B loops of hsdR without a single request leaving the machine. Only the AlphaFold structural check is still fetched.
- The recognition sequence is no longer a column of that table. It belongs to the system rather than to any one subunit, so it was the same string repeated down every row, and while the peptides were unread it was the only filled cell — a DNA answer standing in a table asked for the protein one. It is stated once above the table and marked as DNA.
- A linked subunit with no translation says so instead of vanishing. A pseudogene records neither a peptide nor a protein accession, so BL21(DE3)'s two hsdS and its adenine-methyltransferase were dropped from the table outright, and a subunit that is present and cannot be scanned looked exactly like one that is not there. The panel no longer reports those loci as proteins carrying no motif either: an absence read off a sequence nobody has is not a finding.
- Rebuilding a reference genome's annotation no longer makes resolved subunit links stale. The evidence fingerprint was taken over the whole source record, including the moment it was read, so accepting a rebuilt profile moved no coordinate and renamed no gene and still took every linked locus — and its motif rows — off the panel.
- A locus whose peptide is already in hand is no longer told that no protein accession is recorded for it. What such a locus lacks is a UniProt entry, which is a predicted structure rather than a sequence, and that is what the panel says.
<!-- gene-studio:release:1.3.92:end -->

<!-- gene-studio:release:1.3.91:begin published-at=2026-09-20T06:51:45.000Z -->
### [1.3.91](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.91) — 2026-09-20

- Build the built-in strain library from real reference genomes: fifty assemblies and fifty-four strains, every accession resolved against NCBI. TOP10, DH5α, XL1-Blue and HST04 now take their codon usage, tRNA inventory and ribosome-binding tail from their own complete RefSeq genome instead of K-12's, and the Geobacillus, Fervidobacterium, Thermotoga, Thermus, Parageobacillus, Caldicellulosiruptor, Colwellia, Vibrio, Haloferax and Streptomyces reference strains are built in beside them. Ten assemblies NCBI has suppressed but still serves say so in their own profile.
- Read the R–M motif positions from the protein accession a locus actually names. The panel reached its peptide through UniProt alone, which seven loci in eight do not record, so the catalytic, cofactor and P-loop motif positions were missing for most strains; they are fetched from NCBI by protein accession now, in one request, and a locus with no UniProt accession is given its motif positions and told plainly that it has no predicted structure to check them against.
- A laboratory E. coli host keeps K-12's restriction–modification loci as an explicitly labelled reference. Their own assemblies annotate no hsd gene, so reading the loci from them would have lost the type I subunits the R–M tab exists to show, while their sequence figures remain their own.
- Corynebacterium glutamicum moves to the assembly NCBI flags as the reference genome. Its annotation-derived R–M system identifiers change with it, so a saved document that had recorded a state for one of those systems by hand starts again from the annotation; the published genotypes, Dam, Dcm, CpG, GpC, EcoKI and EcoBI, are unaffected.
<!-- gene-studio:release:1.3.91:end -->

<!-- gene-studio:release:1.3.90:begin published-at=2026-09-20T02:54:01.000Z -->
### [1.3.90](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.90) — 2026-09-20

- Read an R–M subunit's protein from the UniProt accession printed beside it. A built-in strain's linked loci carried the accession and still reported no protein sequence; the motif panel now lists such a locus, fetches its sequence together with the AlphaFold model, and says whether the peptide came from a stored analysis, the open genome or the UniProt entry, preferring a local one.
- Show the linear Figure view whole. An artboard taller than the pane used to run under the fold with its scale bar and note out of sight; it now fits the pane's height as well as its width, keeping its proportions, and the exported figure is unchanged.
<!-- gene-studio:release:1.3.90:end -->

<!-- gene-studio:release:1.3.89:begin published-at=2026-09-20T00:05:26.000Z -->
### [1.3.89](https://github.com/JAEYOONSUNG/GeneStudio-releases/releases/tag/v1.3.89) — 2026-09-20

- Find the catalytic, cofactor and nucleotide-binding motifs of an R–M system's proteins and mark them with their positions: a table per subunit with the catalytic motif, the AdoMet-binding motif and the P-loop in their own columns, the class of an amino-methyltransferase read from the order of its motifs, and every motif carrying the work it is taken from.
- Separate the real motifs from the chance matches with a predicted structure. These patterns are short enough that a genuine methyltransferase offers two or three catalytic candidates, so the panel fetches the locus's AlphaFold model and reports how confident the prediction is where each motif sits and how near its residues come to a residue of another motif family. A motif is called part of a site only when both readings support it.
- The catalogue is measured rather than asserted: against the curated active-site and cofactor residues of 126 reviewed restriction-modification proteins it now covers 81.6% of catalytic residues and 71.4% of cofactor residues, and the structure ranks the curated motif first in eleven of the twelve proteins offering more than one candidate. Motifs that could not earn that are named as needing a profile search instead of being reported unreliably.
<!-- gene-studio:release:1.3.89:end -->

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

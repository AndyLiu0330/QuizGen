# Upload Page (`/`) — Design Overrides

Inherits all rules from MASTER.md. Overrides and additions below.

## Layout

- Two sections: upload zone (top) + materials list (bottom)
- Max-width container centered, single column

## Upload Zone

- Dashed 2px `--border` rectangle, 8px radius, 120px min-height
- Center-aligned icon (Lucide `Upload`) + "Drag files here or click to browse" text
- Hover: border color transitions to `--primary`, bg tint to `--muted`
- Active drag: border solid `--primary`, stronger bg tint
- Accepted types shown as caption below: "PDF, PPTX — Max 50MB"
- Upload progress: inline progress bar below the zone

## Materials List

- Card per material: file icon (based on type), file name, type badge, size, date
- Delete button (Lucide `Trash2`) on hover/focus, right-aligned
- Click card body to navigate to session config
- Empty state: muted text "No materials uploaded yet" + arrow pointing to upload zone

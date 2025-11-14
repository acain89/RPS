import React, { useMemo, useRef, useState } from "react";

function GloveIcon({ color="#ffc93c", size=90, className="" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      style={{ fill: color }}
    >
      <path d="
        M40 110
        C25 110 18 95 18 83
        V40
        C18 33 25 30 30 32
        C36 35 37 42 37 48
        V27
        C37 20 44 18 49 20
        C54 22 55 28 55 34
        V23
        C55 16 62 14 67 17
        C72 20 73 27 73 33
        V30
        C73 23 80 20 85 23
        C90 26 91 33 91 38
        V70
        C91 95 78 110 55 110
        Z
      "/>
    </svg>
  );
}



/* ---------- UI row for one tier ---------- */
function TierRow({
  title,
  items,
  currentIndex,
  onLeft,
  onRight,
  selectedId,
  onSelect,
}) {
  const item = items[currentIndex];

  return (
    <div className="tier-block">
      <div className="tier-label">{title}</div>

      <div className="skin-view">
        <button className="scroll-arrow" onClick={onLeft}>‹</button>

        <div
          className={`skin-card ${item.classes} ${selectedId === item.id ? "selected" : ""}`}
          onClick={() => onSelect(item)}
          title={item.label}
          aria-label={item.label}
        >
          {/* Glove icon */}
          <GloveIcon color={item.color} size={70} />

        </div>

        <button className="scroll-arrow" onClick={onRight}>›</button>
      </div>
    </div>
  );
}

/* ---------- Main panel ---------- */
export default function CustomizePanel({
  open,
  onClose,
  owned = [],
  equipped,
  credits = 0,
  onEquip,
  onUnlock,
}) {
  // Helper: color tint (for Common) – hue-rotate + a little pop
  const tint = (deg, extra = "") =>
    `hue-rotate(${deg}deg) saturate(1.6) brightness(1.1) ${extra}`.trim();

// Build catalog (fields must match how UI reads them)
const CATALOG = useMemo(() => ({

  // ✅ Common — Flat simple color palette (50 colors)
  common: [
    "#ff5f5f","#ff8e5f","#ffb35f","#ffd85f","#ffff5f",
    "#d4ff5f","#9bff5f","#5fff6b","#5fffb8","#5fffff",
    "#5fb8ff","#5f7aff","#8b5fff","#c65fff","#ff5fff",
    "#ff5f9d","#ff5fc6","#ff5fed","#d45fff","#a65fff",
    "#788dff","#5fa8ff","#5fd0ff","#5fffea","#5fffb3",
    "#5fff7e","#81ff5f","#b8ff5f","#ecff5f","#ffe85f",
    "#ffc85f","#ffa45f","#ff6b5f","#ff5f78","#ff5fa8",
    "#ff5fe2","#c85fff","#925fff","#5f7dff","#5faeff",
    "#5fe1ff","#5bffec","#5cffb7","#70ff5c","#a3ff5c",
    "#d8ff5c","#fff75c","#ffd05b","#ff9d5b","#ff5b66",
    "#ff5b98","#ff5bd0"
  ].map((color, i) => ({
    id: `Common-${i+1}`,
    label: `Color ${i+1}`,
    price: 3,
    classes: "type-common",
    color
  })),

  // ✅ Rare — 25 placeholders (patterns coming next)
  rare: Array.from({ length: 25 }, (_, i) => ({
    id: `Rare-${i + 1}`,
    label: `Pattern ${i + 1}`,
    price: 5,
    classes: "type-rare rare-placeholder",
    filter: "contrast(1.2)"
  })),

  // ✅ Epic — 10 placeholders (animated later)
  epic: Array.from({ length: 10 }, (_, i) => ({
    id: `Epic-${i + 1}`,
    label: `Legend ${i + 1}`,
    price: 10,
    classes: "type-epic epic-placeholder",
    color: "#ffffff"
  })),

}), []);


  // Which item is in view per row
  const tierIndex = useRef({ common: 0, rare: 0, epic: 0 });
  const [, forceUpdate] = useState(0);

  function scrollRow(key, dir) {
    const total = CATALOG[key].length;
    tierIndex.current[key] =
      (tierIndex.current[key] + (dir === "left" ? -1 : 1) + total) % total;
    forceUpdate((x) => x + 1);
  }

  // Selection / modal
  const [selected, setSelected] = useState(null);
  const [showNoCredits, setShowNoCredits] = useState(false);

  const isOwned = (id) => owned.includes(id);
  const isEquipped = (id) => equipped === id;

  const buttonDisabled =
    !selected ||
    isEquipped(selected?.id) ||
    (!isOwned(selected?.id) && credits < (selected?.price || 1e9));

  const buttonLabel = !selected
    ? "Unlock"
    : isEquipped(selected.id)
    ? "Equipped ✓"
    : isOwned(selected.id)
    ? "Equip"
    : `Unlock (${selected.price}c)`;

  function handleAction() {
    if (!selected) return;
    if (isEquipped(selected.id)) return;
    if (isOwned(selected.id)) {
      onEquip?.(selected.id);
      return;
    }
    if (credits < selected.price) {
      setShowNoCredits(true);
      return;
    }
    onUnlock?.(selected);
    setSelected(null);
  }

  // Closet (owned)
  const allById = new Map(
    ["common", "rare", "epic"].flatMap((k) =>
      CATALOG[k].map((it) => [it.id, it])
    )
  );
  const closetItems = owned.map((id) => allById.get(id)).filter(Boolean);

  return (
  <>
    <div className={`panel right ${open ? "open" : ""}`}>
      <div className="panel-head">
        <span>CUSTOMIZE ►</span>
        <button className="btn tiny" onClick={onClose}>Close</button>
      </div>

      <h4 className="title earned-note">These upgrades have to be earned!</h4>

      {/* Credits box */}
      <div className="credits-box">
        <span>Credits</span>
        <b>{credits}</b>
      </div>

      {/* Featured glove */}
      <div className="featured-skin">
        <div className="featured-circle">
          <GloveIcon className="glove featured" color={selected?.color || "#ffd93d"} />
        </div>
        <div className="featured-label">
          {selected ? selected.label : "Choose a skin"}
        </div>
      </div>

      {/* Tiers */}
      <TierRow
        title="Common – 3"
        items={CATALOG.common}
        currentIndex={tierIndex.current.common}
        onLeft={() => scrollRow("common", "left")}
        onRight={() => scrollRow("common", "right")}
        selectedId={selected?.id}
        onSelect={setSelected}
      />

      <TierRow
        title="Rare – 5"
        items={CATALOG.rare}
        currentIndex={tierIndex.current.rare}
        onLeft={() => scrollRow("rare", "left")}
        onRight={() => scrollRow("rare", "right")}
        selectedId={selected?.id}
        onSelect={setSelected}
      />

      <TierRow
        title="Epic – 10"
        items={CATALOG.epic}
        currentIndex={tierIndex.current.epic}
        onLeft={() => scrollRow("epic", "left")}
        onRight={() => scrollRow("epic", "right")}
        selectedId={selected?.id}
        onSelect={setSelected}
      />

      <button className="btn mega" disabled={buttonDisabled} onClick={handleAction}>
        {buttonLabel}
      </button>
    </div> {/* end panel */}

          {showNoCredits && (
        <div className="modal-overlay" onClick={() => setShowNoCredits(false)}>
          <div className="modal">
            <h3>Not Enough Credits</h3>
            <p>You need more credits to unlock this skin.</p>
            <button onClick={() => setShowNoCredits(false)}>OK</button>
          </div>
        </div>
      )}
    </>
  ); // ✅ closes return
} // ✅ closes component


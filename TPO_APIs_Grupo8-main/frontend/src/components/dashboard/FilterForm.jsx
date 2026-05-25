export default function FilterForm({
  filters,
  setFilters,
  fields,
  checkboxes = [],
  onSubmit,
  onClear,
  loading,
  styles,
  submitText = 'Buscar',
  clearText = 'Limpiar',
}) {
  const submitBtnStyle = {
    ...styles.btn,
    ...(loading ? styles.btnDisabled : null),
  };

  return (
    <form onSubmit={onSubmit} style={styles.filtersForm ?? styles.filters} aria-busy={loading}>
      <div style={styles.fieldsGrid ?? styles.filters}>
        {fields.map((f) => (
          <input
            key={f.key}
            style={styles.input}
            placeholder={f.placeholder}
            type={f.type ?? 'text'}
            min={f.min}
            value={filters[f.key]}
            onChange={(e) => setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))}
          />
        ))}
      </div>

      {checkboxes.length > 0 && (
        <div style={styles.checkboxesRow}>
          {checkboxes.map((c) => (
            <label key={c.key} style={styles.checkbox}>
              <input
                type="checkbox"
                checked={filters[c.key] === true}
                onChange={(e) => setFilters((prev) => ({ ...prev, [c.key]: e.target.checked ? true : '' }))}
              />
              {c.label}
            </label>
          ))}
        </div>
      )}

      <div style={styles.actionsRow}>
        <button className="ui-btn" style={submitBtnStyle} disabled={loading}>
          {loading ? 'Buscando...' : submitText}
        </button>
        <button className="ui-btn" type="button" style={styles.btnSecondary} onClick={onClear}>
          {clearText}
        </button>
      </div>
    </form>
  );
}

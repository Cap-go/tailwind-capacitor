function joinSafeClassSelector(...parts) {
  const className = parts.join('-');
  return (
    '.' +
    className.replace(/\\/g, '\\\\').replace(/([.#:[\]])/g, '\\$1')
  );
}

module.exports = joinSafeClassSelector;

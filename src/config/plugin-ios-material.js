
module.exports = (({ addVariant, e }) => {
    addVariant('material', ({ modifySelectors, separator }) => {
      modifySelectors(({ className, selector }) => {
        if (selector.includes(':after')) {
          return `.c-material .${e(`material${separator}${className}`)}::after`;
        }
        if (selector.includes(':before')) {
          return `.c-material .${e(
            `material${separator}${className}`
          )}::before`;
        }
        return `.c-material .${e(`material${separator}${className}`)}`;
      });
    });
    addVariant('ios', ({ modifySelectors, separator }) => {
      modifySelectors(({ className, selector }) => {
        if (selector.includes(':after')) {
          return `.c-ios .${e(`ios${separator}${className}`)}::after`;
        }
        if (selector.includes(':before')) {
          return `.c-ios .${e(`ios${separator}${className}`)}::before`;
        }
        return `.c-ios .${e(`ios${separator}${className}`)}`;
      });
    });
    // ios-active: and material-active: variants
    addVariant('material-active', ({ modifySelectors, separator }) => {
      modifySelectors(({ className }) => {
        return `.c-material .${e(
          `material-active${separator}${className}`
        )}:active`;
      });
    });
  
    addVariant('ios-active', ({ modifySelectors, separator }) => {
      modifySelectors(({ className }) => {
        return `.c-ios .${e(`ios-active${separator}${className}`)}:active`;
      });
    });
  });

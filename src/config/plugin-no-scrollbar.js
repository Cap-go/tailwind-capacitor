
module.exports = (({ addUtilities }) => {
    const noScrollbar = {
      '.no-scrollbar': {
        'scrollbar-width': 'none',
      },
      '.no-scrollbar::-webkit-scrollbar': {
        display: 'none',
        opacity: '0',
      },
    };

    addUtilities(noScrollbar);
  });

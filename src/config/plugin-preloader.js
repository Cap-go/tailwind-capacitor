module.exports = (({ addComponents }) => {
    addComponents({
      '.c-ios-preloader > span': {
        animation: 'c-ios-preloader-spin 1s steps(8, end) infinite',
      },

      '.c-material-preloader > span': {
        animation: 'c-material-preloader-rotate 1.4s linear infinite',
      },

      '.c-material-preloader circle': {
        'stroke-dasharray': '100px',
        'stroke-dashoffset': '80px',
        'stroke-width': '4',
        transform: 'rotate(-90deg)',
        'transform-origin': '18px 18px',
        animation:
          'c-material-preloader-circle-rotate 5.6s ease-in-out infinite',
      },

      '@keyframes c-ios-preloader-spin': {
        '0%': {
          transform: 'rotate(0deg)',
        },
        '100%': {
          transform: 'rotate(360deg)',
        },
      },

      '@keyframes c-material-preloader-rotate': {
        '0%': {
          transform: 'rotate(0deg)',
        },
        '100%': {
          transform: 'rotate(360deg)',
        },
      },

      '@keyframes c-material-preloader-circle-rotate': {
        '0%': {
          transform: 'rotate(-90deg)',
          'stroke-dashoffset': '100px',
        },

        '12.50%': {
          transform: 'rotate(-90deg)',
          'stroke-dashoffset': '25px',
        },

        '25%': {
          transform: 'rotate(180deg)',
          'stroke-dashoffset': '100px',
        },

        '25.10%': {
          transform: 'rotate(-180deg)',
          'stroke-dashoffset': '100px',
        },

        '37.50%': {
          transform: 'rotate(-180deg)',
          'stroke-dashoffset': '25px',
        },

        '50%': {
          transform: 'rotate(90deg)',
          'stroke-dashoffset': '100px',
        },

        '50.10%': {
          transform: 'rotate(90deg)',
          'stroke-dashoffset': '100px',
        },

        '62.50%': {
          transform: 'rotate(90deg)',
          'stroke-dashoffset': '25px',
        },

        '75%': {
          transform: 'rotate(360deg)',
          'stroke-dashoffset': '100px',
        },

        '75.10%': {
          transform: 'rotate(0deg)',
          'stroke-dashoffset': '100px',
        },

        '87.50%': {
          transform: 'rotate(0deg)',
          'stroke-dashoffset': '25px',
        },

        '100%': {
          transform: 'rotate(270deg)',
          'stroke-dashoffset': '100px',
        },
      },
    });
  });

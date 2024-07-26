const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    './src/**/*.js',
    flowbite.content(),
    
  ],
  theme: {
    extend: {
    },
    screens: {
      
      'xs': '378px',
      // => @media (min-width: 378px)
      
      'sm': '640px',
      // => @media (min-width: 640px) 

      'md': '768px',
      // => @media (min-width: 768px) 

      'lg': '1023px',
      // => @media (min-width: 1023px) 

      'xl': '1280px',
      // => @media (min-width: 1280px) 

      '2xl': '1536px'
      // => @media (min-width: 1536px)
    }
  },
  plugins: [
    flowbite.plugin(),
  ],
}


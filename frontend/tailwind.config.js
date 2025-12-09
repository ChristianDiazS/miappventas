/** @type {import('tailwindcss').Config} */
   export default {
     darkMode: 'class',
     content: [
       "./index.html",
       "./src/**/*.{js,jsx,ts,tsx}",
     ],
     theme: {
       extend: {
         colors: {
           primary: {
             50: '#f0f9ff',
             100: '#e0f2fe',
             500: '#0ea5e9',
             600: '#0284c7',
             700: '#0369a1',
             900: '#082f49'
           },
           secondary: {
             500: '#8b5cf6',
             600: '#7c3aed'
           },
         },
         fontFamily: {
           sans: ['Inter', 'system-ui', 'sans-serif'],
           display: ['Poppins', 'sans-serif'],
         },
       },
     },
     plugins: [],
   }
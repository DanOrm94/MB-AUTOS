import { SITE, services, locations } from '../config/site';
const slug=(name:string)=>name.toLowerCase().replaceAll(' ','-');
const paths=[
  '/',
  '/about',
  '/contact',
  '/book',
  '/locations',
  ...services.map(s=>`/${s.slug}`),
  ...locations.map(l=>`/locations/${slug(l.name)}`)
];
export const GET=()=>new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${new URL(p,SITE).href}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});

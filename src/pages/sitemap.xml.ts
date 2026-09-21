import { SITE } from '../config/site';
const paths=['/','/mot-testing','/ev-servicing','/bodywork-paintwork','/engine-rebuilds-timing-belts','/servicing-diagnostics','/brakes-tyres-clutches','/about','/contact'];
export const GET=()=>new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p=>`<url><loc>${new URL(p,SITE).href}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml'}});

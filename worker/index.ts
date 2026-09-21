export interface Env {
  DB: D1Database;
  DVLA_API_KEY: string;
  TURNSTILE_SECRET_KEY?: string;
  ALLOWED_ORIGIN?: string;
}

type Service = { id:number; slug:string; name:string; duration_minutes:number; min_bays:number; min_technicians:number; price_pence:number|null; bookable:number };
type Resource = { id:number; name:string; type:'bay'|'technician'; active:number };

const JSON_HEADERS = { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store' };
const TZ = 'Europe/London';

function json(data:unknown,status=200,extra:Record<string,string>={}) {
  return new Response(JSON.stringify(data), { status, headers:{...JSON_HEADERS,...extra} });
}
function cors(origin:string|undefined) {
  const allowed='https://mbautos.co.uk';
  const value=origin===allowed?allowed:allowed;
  return {'access-control-allow-origin':value,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type','vary':'Origin'};
}
function todayLocal(){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const y=parts.find(p=>p.type==='year')?.value||'';
  const m=parts.find(p=>p.type==='month')?.value||'';
  const d=parts.find(p=>p.type==='day')?.value||'';
  return y+'-'+m+'-'+d;
}
function vrn(v:string){return v.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)}
function email(v:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&v.length<=160}
function dateOnly(v:string){return /^\d{4}-\d{2}-\d{2}$/.test(v)}
function mins(v:string){const [h,m]=v.split(':').map(Number);return h*60+m}
function dayName(date:string){return new Intl.DateTimeFormat('en-GB',{timeZone:TZ,weekday:'long'}).format(new Date(date+'T12:00:00Z'))}
function localToUtc(date:string,time:string){
  const naive=new Date(date+'T'+time+':00Z');
  const zone=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,timeZoneName:'shortOffset',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(naive).find(p=>p.type==='timeZoneName')?.value||'GMT';
  const m=zone.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  const offset=m?(Number(m[2])*60+Number(m[3]||0))*(m[1]==='-'?-1:1):0;
  return new Date(naive.getTime()-offset*60000).toISOString();
}
function isoLocal(date:string,minute:number){return localToUtc(date,String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0'))}
function addMinutes(iso:string,n:number){return new Date(new Date(iso).getTime()+n*60000).toISOString()}
function blockStarts(start:string,end:string){const out:string[]=[];for(let t=new Date(start);t<new Date(end);t=new Date(t.getTime()+30*60000))out.push(t.toISOString());return out}

async function turnstile(request:Request,env:Env,token?:string){
  if(!env.TURNSTILE_SECRET_KEY||!token)return false;
  const f=new FormData();f.set('secret',env.TURNSTILE_SECRET_KEY);f.set('response',token);
  const ip=request.headers.get('CF-Connecting-IP');if(ip)f.set('remoteip',ip);
  const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:f});
  return (await r.json() as {success?:boolean}).success===true;
}
async function service(env:Env,slug:string){
  return env.DB.prepare('SELECT id,slug,name,duration_minutes,min_bays,min_technicians,price_pence,bookable FROM services WHERE slug=? AND active=1 LIMIT 1').bind(slug).first<Service>();
}
async function resources(env:Env,type:'bay'|'technician'){
  return (await env.DB.prepare('SELECT id,name,type,active FROM resources WHERE type=? AND active=1 ORDER BY id').bind(type).all<Resource>()).results;
}
async function freeResource(env:Env,type:'bay'|'technician',start:string,end:string){
  const rs=await resources(env,type);
  const used=(await env.DB.prepare("SELECT resource_id FROM booking_resource_blocks br JOIN bookings b ON b.id=br.booking_id WHERE br.block_start < ? AND datetime(br.block_start,'+30 minutes') > ? AND b.status IN ('pending','confirmed') GROUP BY resource_id").bind(end,start).all<{resource_id:number}>()).results;
  const ids=new Set(used.map(x=>x.resource_id));
  return rs.find(r=>!ids.has(r.id));
}
async function availability(env:Env,s:Service,date:string){
  const h=await env.DB.prepare('SELECT opens_at,closes_at,bookable FROM business_hours WHERE weekday=? LIMIT 1').bind(dayName(date)).first<{opens_at:string|null,closes_at:string|null,bookable:number}>();
  if(!h?.opens_at||!h.closes_at||!h.bookable)return [];
  const out:{start:string;end:string;label:string}[]=[];
  for(let m=mins(h.opens_at);m+s.duration_minutes<=mins(h.closes_at);m+=30){
    const start=isoLocal(date,m),end=addMinutes(start,s.duration_minutes);
    const bay=await freeResource(env,'bay',start,end),tech=await freeResource(env,'technician',start,end);
    if((!s.min_bays||bay)&&(!s.min_technicians||tech)){
      out.push({start,end,label:new Intl.DateTimeFormat('en-GB',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(start))});
    }
  }
  return out;
}

export default {
  async fetch(request:Request,env:Env){
    const headers=cors(env.ALLOWED_ORIGIN||request.headers.get('Origin')||undefined);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    const url=new URL(request.url);
    try{
      if(url.pathname==='/api/services'&&request.method==='GET'){
        const r=await env.DB.prepare('SELECT slug,name,duration_minutes,price_pence FROM services WHERE active=1 AND bookable=1 ORDER BY sort_order,name').all();
        return json(r.results,200,headers);
      }
      if(url.pathname==='/api/vehicle/lookup'&&request.method==='POST'){
        const body=await request.json().catch(()=>null) as {registration?:string}|null, registration=vrn(body?.registration||'');
        if(registration.length<2||registration.length>8)return json({error:'Enter a valid vehicle registration.'},400,headers);
        const cached=await env.DB.prepare('SELECT registration,make,model,fuel_type,engine_cc,year_of_manufacture,mot_status,mot_expiry,colour FROM vehicle_lookup_cache WHERE registration=? AND expires_at>?').bind(registration,Date.now()).first<any>();
        if(cached)return json({...cached,cached:true},200,headers);
        if(!env.DVLA_API_KEY)return json({error:'Vehicle lookup is not configured.'},503,headers);
        const r=await fetch('https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles',{method:'POST',headers:{'content-type':'application/json','x-api-key':env.DVLA_API_KEY},body:JSON.stringify({registrationNumber:registration})});
        if(r.status===404)return json({error:'Vehicle not found. Check the registration and try again.'},404,headers);
        if(!r.ok)return json({error:'Vehicle lookup is temporarily unavailable.'},502,headers);
        const v=await r.json() as any, now=Date.now(), expires=now+7*86400000;
        await env.DB.prepare('INSERT INTO vehicle_lookup_cache (registration,make,model,fuel_type,engine_cc,year_of_manufacture,mot_status,mot_expiry,colour,raw_json,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(registration) DO UPDATE SET make=excluded.make,model=excluded.model,fuel_type=excluded.fuel_type,engine_cc=excluded.engine_cc,year_of_manufacture=excluded.year_of_manufacture,mot_status=excluded.mot_status,mot_expiry=excluded.mot_expiry,colour=excluded.colour,raw_json=excluded.raw_json,expires_at=excluded.expires_at').bind(registration,v.make||null,null,v.fuelType||null,v.engineCapacity||null,v.yearOfManufacture||null,v.motStatus||null,v.motExpiryDate||null,v.colour||null,JSON.stringify(v),expires).run();
        return json({registration,make:v.make||null,model:null,fuel_type:v.fuelType||null,engine_cc:v.engineCapacity||null,year_of_manufacture:v.yearOfManufacture||null,mot_status:v.motStatus||null,mot_expiry:v.motExpiryDate||null,colour:v.colour||null,cached:false},200,headers);
      }
      if(url.pathname==='/api/availability'&&request.method==='GET'){
        const slug=url.searchParams.get('service')||'',date=url.searchParams.get('date')||'';
        if(!dateOnly(date))return json({error:'Invalid date.'},400,headers);
        if(date<todayLocal())return json({error:'Date is in the past.'},400,headers);
        const s=await service(env,slug);if(!s)return json({error:'Service not found.'},404,headers);
        return json({service:{slug:s.slug,name:s.name,duration_minutes:s.duration_minutes},date,slots:await availability(env,s,date)},200,headers);
      }
      if(url.pathname==='/api/bookings'&&request.method==='POST'){
        const b=await request.json().catch(()=>null) as any;
        if(!b||!await turnstile(request,env,b.turnstileToken))return json({error:'Verification failed. Please try again.'},400,headers);
        const name=String(b.name||'').trim(),phone=String(b.phone||'').trim(),mail=String(b.email||'').trim(),registration=vrn(String(b.registration||'')),slug=String(b.service||''),start=String(b.start||''),notes=String(b.notes||'').trim();
        if(name.length<2||name.length>100||phone.length<7||phone.length>40||!email(mail)||registration.length<2||!slug||!start)return json({error:'Please complete all required booking fields.'},400,headers);
        const s=await service(env,slug);if(!s)return json({error:'Service not found.'},404,headers);
        const parsedStart=new Date(start);
        if(Number.isNaN(parsedStart.getTime()))return json({error:'Invalid appointment time.'},400,headers);
        const localDate=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(parsedStart);
        const startDate=(localDate.find(p=>p.type==='year')?.value||'')+'-'+(localDate.find(p=>p.type==='month')?.value||'')+'-'+(localDate.find(p=>p.type==='day')?.value||'');
        if(startDate<todayLocal())return json({error:'Appointment time is in the past.'},400,headers);
        const slots=await availability(env,s,startDate);
        if(!slots.some(x=>x.start===start))return json({error:'That appointment time is no longer available. Please choose another time.'},409,headers);
        const end=addMinutes(start,s.duration_minutes);
        const freeBay=await freeResource(env,'bay',start,end),freeTech=await freeResource(env,'technician',start,end);
        if((s.min_bays&&!freeBay)||(s.min_technicians&&!freeTech))return json({error:'That slot has just been taken. Please choose another time.'},409,headers);
        const customer=await env.DB.prepare('SELECT id FROM customers WHERE email=?').bind(mail).first<{id:number}>();
        const now=new Date().toISOString();
        const customerId=customer?.id;
        if(!customerId)await env.DB.prepare('INSERT INTO customers(name,email,phone,created_at) VALUES(?,?,?,?)').bind(name,mail,phone,now).run();
        const c=customer||await env.DB.prepare('SELECT id FROM customers WHERE email=?').bind(mail).first<{id:number}>();
        if(!c)return json({error:'Could not create customer.'},500,headers);
        const vehicle=await env.DB.prepare('SELECT id FROM vehicles WHERE registration=?').bind(registration).first<{id:number}>();
        if(!vehicle)await env.DB.prepare('INSERT INTO vehicles(customer_id,registration,created_at,updated_at) VALUES(?,?,?,?)').bind(c.id,registration,now,now).run().catch(()=>{});
        const v=vehicle||await env.DB.prepare('SELECT id FROM vehicles WHERE registration=?').bind(registration).first<{id:number}>();
        if(!v)return json({error:'Could not create vehicle.'},500,headers);
        const booking=await env.DB.prepare('INSERT INTO bookings(customer_id,vehicle_id,service_id,starts_at,ends_at,bay_id,technician_id,status,notes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(c.id,v.id,s.id,start,end,freeBay?.id||null,freeTech?.id||null,'pending',notes,now).run();
        const bookingId=Number(booking.meta.last_row_id);
        try{
          const blocks=blockStarts(start,end);
          const stmts=[];
          if(freeBay)for(const block of blocks)stmts.push(env.DB.prepare('INSERT INTO booking_resource_blocks(booking_id,resource_id,block_start) VALUES(?,?,?)').bind(bookingId,freeBay.id,block));
          if(freeTech)for(const block of blocks)stmts.push(env.DB.prepare('INSERT INTO booking_resource_blocks(booking_id,resource_id,block_start) VALUES(?,?,?)').bind(bookingId,freeTech.id,block));
          if(stmts.length)await env.DB.batch(stmts);
        }catch{
          await env.DB.prepare("UPDATE bookings SET status='cancelled' WHERE id=?").bind(bookingId).run();
          return json({error:'That slot has just been taken. Please choose another time.'},409,headers);
        }
        return json({ok:true,bookingId,status:'pending'},201,headers);
      }
      return json({error:'Not found.'},404,headers);
    }catch(e){console.error(e);return json({error:'Something went wrong. Please call MB Autos.'},500,headers)}
  }
};

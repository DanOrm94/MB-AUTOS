export const SITE = 'https://mbautos.co.uk';

export const business = {
  name: 'MB Autos',
  tagline: 'MOTs, repairs and bodywork in Mossley',
  street: 'Unit 3 (the garage), Camden Street, off Manchester Road',
  locality: 'Mossley',
  region: 'Ashton-under-Lyne',
  postcode: 'OL5 9BD',
  country: 'GB',
  phone: '07449 226255',
  email: 'mbautosmotcentre@gmail.com',
  bookingUrl: 'https://www.sumupbookings.com/m-b-autos',
  priceRange: '££',
  motPriceDisplay: '£XX',
  yearsExperience: '30+ years',
  ratingValue: 5.0,
  reviewCount: 13,
  googleReviewsUrl: 'https://www.google.com/search?q=MB+Autos+Mossley+Google+reviews',
  geo: { lat: 53.5149, lng: -2.0448 },
  hours: [
    { day: 'Monday', opens: '08:30', closes: '17:30' },
    { day: 'Tuesday', opens: '08:30', closes: '17:30' },
    { day: 'Wednesday', opens: '08:30', closes: '17:30' },
    { day: 'Thursday', opens: '08:30', closes: '17:30' },
    { day: 'Friday', opens: '08:30', closes: '17:30' },
    { day: 'Saturday', note: 'By appointment' },
    { day: 'Sunday', note: 'Closed' }
  ]
} as const;

export const serviceOptions = [
  'MOT',
  'EV MOT / servicing',
  'Pre-MOT / failure work',
  'Bodywork / paintwork',
  'Engine / timing belts',
  'Servicing / diagnostics',
  'Brakes / tyres / clutches',
  'Other'
] as const;

export const services = [
  { slug: 'mot-testing', title: 'MOT testing', short: 'Class 4 & 7 MOTs with a straight answer on what needs doing.', price: 'From ' + business.motPriceDisplay },
  { slug: 'ev-servicing', title: 'EV MOT & servicing', short: 'IMI Level 4 qualified EV technician for modern electric cars.' },
  { slug: 'bodywork-paintwork', title: 'Bodywork & paintwork', short: 'Panel repairs, replacements and paintwork without the faff.' },
  { slug: 'engine-rebuilds-timing-belts', title: 'Engine rebuilds & timing belts', short: 'Engines, timing belts and wet belts handled properly.' },
  { slug: 'servicing-diagnostics', title: 'Servicing & diagnostics', short: 'Routine servicing, fault finding and the jobs that keep cars right.' },
  { slug: 'brakes-tyres-clutches', title: 'Brakes, tyres & clutches', short: 'Everyday wear-and-tear repairs, from brakes to clutches.' }
] as const;

export const locations = [
  { name: 'Mossley', copy: 'Based in Mossley off Manchester Road, with straightforward access from across the valley.' },
  { name: 'Ashton-under-Lyne', copy: 'A local MOT and repair option for drivers in and around Ashton-under-Lyne.' },
  { name: 'Stalybridge', copy: 'Useful for Stalybridge drivers who want a proper local garage rather than a chain.' },
  { name: 'Oldham', copy: 'Serving customers from the Oldham area for MOTs, servicing, repairs and bodywork.' }
] as const;

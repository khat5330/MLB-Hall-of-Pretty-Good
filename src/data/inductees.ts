export type Inductee = {
  id: number;
  slug: string;
  name: string;
  pos: string;
  debut: string;
  last: string;
  bats: string;
  throws: string;
  bwar?: number | null;
  innerCircle?: boolean;
  prettyUnanimous?: boolean;
};

/**
 * Inductees of the MLB Hall of Pretty Good.
 * `id` is the MLB Stats API person id. `bwar` is career Baseball-Reference WAR.
 */
export const inductees: Inductee[] = [
  { id: 518553, slug: "steve-cishek", name: "Steve Cishek", pos: "P", debut: "2010", last: "2022", bats: "R", throws: "R", bwar: 13.3 },
  { id: 448602, slug: "mark-reynolds", name: "Mark Reynolds", pos: "3B", debut: "2007", last: "2019", bats: "R", throws: "R", bwar: 6.9 },
  { id: 121108, slug: "harold-reynolds", name: "Harold Reynolds", pos: "2B", debut: "1983", last: "1994", bats: "S", throws: "R", bwar: 15.8 },
  { id: 502210, slug: "josh-reddick", name: "Josh Reddick", pos: "RF", debut: "2009", last: "2021", bats: "L", throws: "R", bwar: 24.9 },
  { id: 430001, slug: "rickie-weeks", name: "Rickie Weeks Jr.", pos: "2B", debut: "2003", last: "2017", bats: "R", throws: "R", bwar: 11.6 },
  { id: 150289, slug: "carlos-pena", name: "Carlos Pena", pos: "1B", debut: "2001", last: "2014", bats: "L", throws: "L", bwar: 25.5 },
  { id: 598265, slug: "jackie-bradley-jr", name: "Jackie Bradley Jr.", pos: "CF", debut: "2013", last: "2023", bats: "L", throws: "R", bwar: 16.6 },
  { id: 435559, slug: "kurt-suzuki", name: "Kurt Suzuki", pos: "C", debut: "2007", last: "2022", bats: "R", throws: "R", bwar: 19.6 },
  { id: 543401, slug: "jason-kipnis", name: "Jason Kipnis", pos: "2B", debut: "2011", last: "2020", bats: "L", throws: "R", bwar: 21.1 },
  { id: 431148, slug: "scott-kazmir", name: "Scott Kazmir", pos: "P", debut: "2004", last: "2021", bats: "L", throws: "L", bwar: 22.3 },
  { id: 452655, slug: "denard-span", name: "Denard Span", pos: "CF", debut: "2008", last: "2018", bats: "L", throws: "L", bwar: 28.0 },
  { id: 543333, slug: "eric-hosmer", name: "Eric Hosmer", pos: "1B", debut: "2011", last: "2023", bats: "L", throws: "L", bwar: 19.1 },
  { id: 425686, slug: "hideki-matsui", name: "Hideki Matsui", pos: "LF", debut: "2003", last: "2012", bats: "L", throws: "R", bwar: 31.4 , innerCircle: true },
  { id: 425664, slug: "shane-victorino", name: "Shane Victorino", pos: "CF", debut: "2003", last: "2015", bats: "S", throws: "R", bwar: 31.4 , innerCircle: true },
  { id: 503285, slug: "darren-o-day", name: "Darren O'Day", pos: "P", debut: "2008", last: "2022", bats: "R", throws: "R", bwar: 17.4 , innerCircle: true },
  { id: 543829, slug: "dee-strange-gordon", name: "Dee Strange-Gordon", pos: "2B", debut: "2011", last: "2022", bats: "L", throws: "R", bwar: 12.9 },
  { id: 457803, slug: "jay-bruce", name: "Jay Bruce", pos: "RF", debut: "2008", last: "2021", bats: "L", throws: "L", bwar: 19.7 , innerCircle: true },
  { id: 448306, slug: "james-shields", name: "James Shields", pos: "P", debut: "2006", last: "2018", bats: "R", throws: "R", bwar: 30.7 },
  { id: 457706, slug: "austin-jackson", name: "Austin Jackson", pos: "CF", debut: "2010", last: "2018", bats: "R", throws: "R", bwar: 21.9 },
  { id: 429722, slug: "ervin-santana", name: "Ervin Santana", pos: "P", debut: "2005", last: "2021", bats: "R", throws: "R", bwar: 27.0 },
  { id: 150229, slug: "a-j-pierzynski", name: "A.J. Pierzynski", pos: "C", debut: "1998", last: "2016", bats: "L", throws: "R", bwar: 23.7 , innerCircle: true },
  { id: 452254, slug: "hunter-pence", name: "Hunter Pence", pos: "RF", debut: "2007", last: "2020", bats: "R", throws: "R", bwar: 30.9 , innerCircle: true },
  { id: 572761, slug: "matt-carpenter", name: "Matt Carpenter", pos: "3B", debut: "2011", last: "2024", bats: "L", throws: "R", bwar: 28.7 , innerCircle: true },
  { id: 136780, slug: "mike-lowell", name: "Mike Lowell", pos: "3B", debut: "1998", last: "2010", bats: "R", throws: "R", bwar: 17.5 , innerCircle: true },
  { id: 518960, slug: "jonathan-lucroy", name: "Jonathan Lucroy", pos: "C", debut: "2010", last: "2021", bats: "R", throws: "R", bwar: 17.5 },
  { id: 457918, slug: "j-a-happ", name: "J.A. Happ", pos: "P", debut: "2007", last: "2021", bats: "L", throws: "L", bwar: 21.1 },
  { id: 448281, slug: "sean-doolittle", name: "Sean Doolittle", pos: "P", debut: "2012", last: "2022", bats: "L", throws: "L", bwar: 10.0 , innerCircle: true },
  { id: 430945, slug: "adam-jones", name: "Adam Jones", pos: "CF", debut: "2006", last: "2019", bats: "R", throws: "R", bwar: 32.5 , innerCircle: true, prettyUnanimous: true },
  { id: 592743, slug: "andrelton-simmons", name: "Andrelton Simmons", pos: "SS", debut: "2012", last: "2022", bats: "R", throws: "R", bwar: 36.5 , innerCircle: true },
  { id: 123801, slug: "tim-wakefield", name: "Tim Wakefield", pos: "P", debut: "1992", last: "2011", bats: "R", throws: "R", bwar: 34.4 , innerCircle: true },
  { id: 461858, slug: "trevor-plouffe", name: "Trevor Plouffe", pos: "3B", debut: "2010", last: "2018", bats: "R", throws: "R", bwar: 7.4 },
  { id: 276055, slug: "adam-dunn", name: "Adam Dunn", pos: "LF", debut: "2001", last: "2014", bats: "L", throws: "R", bwar: 18.0 , innerCircle: true },
  { id: 113375, slug: "dom-dimaggio", name: "Dom DiMaggio", pos: "CF", debut: "1940", last: "1953", bats: "R", throws: "R", bwar: 33.6 , innerCircle: true },
  { id: 446099, slug: "john-axford", name: "John Axford", pos: "P", debut: "2009", last: "2021", bats: "R", throws: "R", bwar: 4.0 },
  { id: 519058, slug: "mike-moustakas", name: "Mike Moustakas", pos: "3B", debut: "2011", last: "2023", bats: "L", throws: "R", bwar: 12.7 , innerCircle: true },
  { id: 543281, slug: "josh-harrison", name: "Josh Harrison", pos: "2B", debut: "2011", last: "2023", bats: "R", throws: "R", bwar: 16.1 },
  { id: 444843, slug: "andre-ethier", name: "Andre Ethier", pos: "RF", debut: "2006", last: "2017", bats: "L", throws: "L", bwar: 21.5 , innerCircle: true },
  { id: 448801, slug: "chris-davis", name: "Chris Davis", pos: "1B", debut: "2008", last: "2020", bats: "L", throws: "R", bwar: 11.7 },
  { id: 501981, slug: "khris-davis", name: "Khris Davis", pos: "LF", debut: "2013", last: "2021", bats: "R", throws: "R", bwar: 10.7 },
  { id: 113054, slug: "ron-darling", name: "Ron Darling", pos: "P", debut: "1983", last: "1995", bats: "R", throws: "R", bwar: 19.6 },
  { id: 112216, slug: "hal-chase", name: "Hal Chase", pos: "1B", debut: "1905", last: "1919", bats: "R", throws: "L", bwar: 23.0 },
  { id: 607680, slug: "kevin-pillar", name: "Kevin Pillar", pos: "LF", debut: "2013", last: "2025", bats: "R", throws: "R", bwar: 16.1 },
  { id: 121693, slug: "benito-santiago", name: "Benito Santiago", pos: "C", debut: "1986", last: "2005", bats: "R", throws: "R", bwar: 27.4 , innerCircle: true },
  { id: 114465, slug: "travis-fryman", name: "Travis Fryman", pos: "3B", debut: "1990", last: "2002", bats: "R", throws: "R", bwar: 34.4 , innerCircle: true },
  { id: 121280, slug: "bip-roberts", name: "Bip Roberts", pos: "2B", debut: "1986", last: "1998", bats: "S", throws: "R", bwar: 20.5 },
  { id: 453056, slug: "jacoby-ellsbury", name: "Jacoby Ellsbury", pos: "CF", debut: "2007", last: "2017", bats: "L", throws: "L", bwar: 31.0 , innerCircle: true },
  { id: 448179, slug: "rich-hill", name: "Rich Hill", pos: "P", debut: "2005", last: "2025", bats: "L", throws: "L", bwar: 16.0 , innerCircle: true },
  { id: 425883, slug: "dontrelle-willis", name: "Dontrelle Willis", pos: "P", debut: "2003", last: "2011", bats: "L", throws: "L", bwar: 19.7 },
  { id: 115136, slug: "ken-griffey", name: "Ken Griffey Sr.", pos: "RF", debut: "1973", last: "1991", bats: "L", throws: "L", bwar: 34.6 , innerCircle: true },
  { id: 134268, slug: "kerry-wood", name: "Kerry Wood", pos: "P", debut: "1998", last: "2012", bats: "R", throws: "R", bwar: 27.6 , innerCircle: true },
  { id: 111676, slug: "jay-buhner", name: "Jay Buhner", pos: "RF", debut: "1987", last: "2001", bats: "R", throws: "R", bwar: 23.0 },
  { id: 114166, slug: "eddie-fisher", name: "Eddie Fisher", pos: "P", debut: "1959", last: "1973", bats: "R", throws: "R", bwar: 10.1 },
  { id: 544369, slug: "didi-gregorius", name: "Didi Gregorius", pos: "SS", debut: "2012", last: "2022", bats: "L", throws: "R", bwar: 17.3 },
  { id: 113074, slug: "darren-daulton", name: "Darren Daulton", pos: "C", debut: "1983", last: "1997", bats: "L", throws: "R", bwar: 23.0 },
  { id: 453943, slug: "todd-frazier", name: "Todd Frazier", pos: "3B", debut: "2011", last: "2021", bats: "R", throws: "R", bwar: 25.8 , innerCircle: true },
  { id: 115174, slug: "marquis-grissom", name: "Marquis Grissom", pos: "CF", debut: "1989", last: "2005", bats: "R", throws: "R", bwar: 29.6 , innerCircle: true },
  { id: 425903, slug: "kevin-youkilis", name: "Kevin Youkilis", pos: "1B", debut: "2004", last: "2013", bats: "R", throws: "R", bwar: 32.4 , innerCircle: true },
  { id: 543294, slug: "kyle-hendricks", name: "Kyle Hendricks", pos: "P", debut: "2014", last: "2025", bats: "R", throws: "R", bwar: 22.8 , innerCircle: true },
  { id: 476454, slug: "dellin-betances", name: "Dellin Betances", pos: "P", debut: "2011", last: "2021", bats: "R", throws: "R", bwar: 11.1 },
  { id: 456714, slug: "billy-butler", name: "Billy Butler", pos: "DH", debut: "2007", last: "2016", bats: "R", throws: "R", bwar: 11.8 },
  { id: 113815, slug: "dock-ellis", name: "Dock Ellis", pos: "P", debut: "1968", last: "1979", bats: "S", throws: "R", bwar: 14.2 , innerCircle: true },
  { id: 461314, slug: "matt-kemp", name: "Matt Kemp", pos: "CF", debut: "2006", last: "2020", bats: "R", throws: "R", bwar: 21.6 , innerCircle: true },
  { id: 113409, slug: "joe-dobson", name: "Joe Dobson", pos: "P", debut: "1939", last: "1954", bats: "R", throws: "R", bwar: 26.3 },
  { id: 110236, slug: "garret-anderson", name: "Garret Anderson", pos: "LF", debut: "1994", last: "2010", bats: "L", throws: "L", bwar: 25.7 , innerCircle: true },
  { id: 446899, slug: "brad-ziegler", name: "Brad Ziegler", pos: "P", debut: "2008", last: "2018", bats: "R", throws: "R", bwar: 13.3 },
  { id: 110009, slug: "jim-abbott", name: "Jim Abbott", pos: "P", debut: "1989", last: "1999", bats: "L", throws: "L", bwar: 19.6 },
  { id: 114971, slug: "tom-gordon", name: "Tom Gordon", pos: "P", debut: "1988", last: "2009", bats: "R", throws: "R", bwar: 35.0 , innerCircle: true },
  { id: 150212, slug: "michael-cuddyer", name: "Michael Cuddyer", pos: "RF", debut: "2001", last: "2015", bats: "R", throws: "R", bwar: 17.8 , innerCircle: true },
  { id: 453568, slug: "charlie-blackmon", name: "Charlie Blackmon", pos: "CF", debut: "2011", last: "2024", bats: "L", throws: "L", bwar: 21.5 , innerCircle: true, prettyUnanimous: true },
  { id: 123211, slug: "mickey-tettleton", name: "Mickey Tettleton", pos: "C", debut: "1984", last: "1997", bats: "S", throws: "R", bwar: 29.3 },
  { id: 150359, slug: "a-j-burnett", name: "A.J. Burnett", pos: "P", debut: "1999", last: "2015", bats: "R", throws: "R", bwar: 28.8 , innerCircle: true },
  { id: 133225, slug: "ryan-dempster", name: "Ryan Dempster", pos: "P", debut: "1998", last: "2013", bats: "R", throws: "R", bwar: 18.6 },
  { id: 434622, slug: "ubaldo-jimenez", name: "Ubaldo Jiménez", pos: "P", debut: "2006", last: "2017", bats: "R", throws: "R", bwar: 20.4 },
  { id: 111312, slug: "oil-can-boyd", name: "Dennis \"Oil Can\" Boyd", pos: "P", debut: "1982", last: "1991", bats: "R", throws: "R", bwar: 17.3 },
  { id: 117339, slug: "john-kruk", name: "John Kruk", pos: "1B", debut: "1986", last: "1995", bats: "L", throws: "L", bwar: 25.1 , innerCircle: true },
  { id: 334393, slug: "juan-pierre", name: "Juan Pierre", pos: "CF", debut: "2000", last: "2013", bats: "L", throws: "L", bwar: 17.3 , innerCircle: true },
  { id: 112064, slug: "joe-carter", name: "Joe Carter", pos: "LF", debut: "1983", last: "1998", bats: "R", throws: "R", bwar: 19.5 , innerCircle: true },
  { id: 453192, slug: "andrew-miller", name: "Andrew Miller", pos: "P", debut: "2006", last: "2021", bats: "L", throws: "L", bwar: 7.7 , innerCircle: true },
  { id: 425902, slug: "prince-fielder", name: "Prince Fielder", pos: "1B", debut: "2005", last: "2016", bats: "L", throws: "R", bwar: 23.6 , innerCircle: true, prettyUnanimous: true },
  { id: 542255, slug: "ender-inciarte", name: "Ender Inciarte", pos: "CF", debut: "2014", last: "2022", bats: "L", throws: "L", bwar: 17.9 },
  { id: 114102, slug: "mark-fidrych", name: "Mark Fidrych", pos: "P", debut: "1976", last: "1980", bats: "R", throws: "R", bwar: 11.3 },
  { id: 460086, slug: "alex-gordon", name: "Alex Gordon", pos: "LF", debut: "2007", last: "2020", bats: "L", throws: "R", bwar: 34.8 , innerCircle: true },
  { id: 516416, slug: "jean-segura", name: "Jean Segura", pos: "SS", debut: "2012", last: "2023", bats: "R", throws: "R", bwar: 26.3 , innerCircle: true },
];

export const inducteesBySlug = new Map(inductees.map((p) => [p.slug, p]));

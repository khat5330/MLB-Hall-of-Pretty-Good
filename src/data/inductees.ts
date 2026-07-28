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
};

/**
 * Inductees of the MLB Hall of Pretty Good.
 * Add or remove entries here as the Instagram account inducts more players.
 * `id` is the MLB Stats API person id.
 */
export const inductees: Inductee[] = [
  { id: 110029, slug: "bobby-abreu", name: "Bobby Abreu", pos: "RF", debut: "1996", last: "2014", bats: "L", throws: "R", bwar: 60.2 },
  { id: 113744, slug: "jim-edmonds", name: "Jim Edmonds", pos: "CF", debut: "1993", last: "2010", bats: "L", throws: "L" },
  { id: 117863, slug: "kenny-lofton", name: "Kenny Lofton", pos: "CF", debut: "1991", last: "2007", bats: "L", throws: "L" },
  { id: 121640, slug: "tim-salmon", name: "Tim Salmon", pos: "RF", debut: "1992", last: "2006", bats: "R", throws: "R" },
  { id: 120878, slug: "brad-radke", name: "Brad Radke", pos: "P", debut: "1995", last: "2006", bats: "R", throws: "R" },
  { id: 133380, slug: "aramis-ramirez", name: "Aramis Ramirez", pos: "3B", debut: "1998", last: "2015", bats: "R", throws: "R" },
  { id: 116338, slug: "torii-hunter", name: "Torii Hunter", pos: "CF", debut: "1997", last: "2015", bats: "R", throws: "R" },
  { id: 279824, slug: "mark-buehrle", name: "Mark Buehrle", pos: "P", debut: "2000", last: "2015", bats: "L", throws: "L" },
  { id: 120691, slug: "jorge-posada", name: "Jorge Posada", pos: "C", debut: "1995", last: "2011", bats: "S", throws: "R" },
  { id: 113028, slug: "johnny-damon", name: "Johnny Damon", pos: "CF", debut: "1995", last: "2012", bats: "L", throws: "L" },
  { id: 113232, slug: "carlos-delgado", name: "Carlos Delgado", pos: "1B", debut: "1993", last: "2009", bats: "L", throws: "R" },
  { id: 121604, slug: "bret-saberhagen", name: "Bret Saberhagen", pos: "P", debut: "1984", last: "2001", bats: "R", throws: "R" },
  { id: 113936, slug: "dwight-evans", name: "Dwight Evans", pos: "RF", debut: "1972", last: "1991", bats: "R", throws: "R" },
  { id: 112345, slug: "will-clark", name: "Will Clark", pos: "1B", debut: "1986", last: "2000", bats: "L", throws: "L" },
  { id: 204020, slug: "lance-berkman", name: "Lance Berkman", pos: "1B", debut: "1999", last: "2013", bats: "S", throws: "L" },
  { id: 120485, slug: "andy-pettitte", name: "Andy Pettitte", pos: "P", debut: "1995", last: "2013", bats: "L", throws: "L" },
  { id: 112552, slug: "david-cone", name: "David Cone", pos: "P", debut: "1986", last: "2003", bats: "L", throws: "R" },
  { id: 111554, slug: "kevin-brown", name: "Kevin Brown", pos: "P", debut: "1986", last: "2005", bats: "R", throws: "R" },
  { id: 110189, slug: "moises-alou", name: "Moises Alou", pos: "LF", debut: "1990", last: "2008", bats: "R", throws: "R" },
  { id: 117484, slug: "ray-lankford", name: "Ray Lankford", pos: "CF", debut: "1990", last: "2004", bats: "L", throws: "L" },
  { id: 408306, slug: "rocco-baldelli", name: "Rocco Baldelli", pos: "CF", debut: "2003", last: "2010", bats: "R", throws: "R" },
  { id: 112903, slug: "jose-cruz-jr", name: "José Cruz Jr.", pos: "CF", debut: "1997", last: "2008", bats: "S", throws: "R" },
  { id: 279578, slug: "marcus-giles", name: "Marcus Giles", pos: "2B", debut: "2001", last: "2007", bats: "R", throws: "R" },
  { id: 400023, slug: "aaron-rowand", name: "Aaron Rowand", pos: "CF", debut: "2001", last: "2011", bats: "R", throws: "R" },
  { id: 135784, slug: "placido-polanco", name: "Placido Polanco", pos: "2B", debut: "1998", last: "2013", bats: "R", throws: "R" },
  { id: 407861, slug: "orlando-hudson", name: "Orlando Hudson", pos: "2B", debut: "2002", last: "2012", bats: "S", throws: "R" },
  { id: 424825, slug: "coco-crisp", name: "Coco Crisp", pos: "CF", debut: "2002", last: "2016", bats: "S", throws: "R" },
  { id: 455976, slug: "nick-markakis", name: "Nick Markakis", pos: "RF", debut: "2006", last: "2020", bats: "L", throws: "L" },
  { id: 276055, slug: "adam-dunn", name: "Adam Dunn", pos: "LF", debut: "2001", last: "2014", bats: "L", throws: "R" },
  { id: 150324, slug: "carlos-lee", name: "Carlos Lee", pos: "LF", debut: "1999", last: "2012", bats: "R", throws: "R" },
  { id: 150404, slug: "ted-lilly", name: "Ted Lilly", pos: "P", debut: "1999", last: "2013", bats: "L", throws: "L" },
  { id: 279782, slug: "jon-garland", name: "Jon Garland", pos: "P", debut: "2000", last: "2013", bats: "R", throws: "R" },
  { id: 115817, slug: "livan-hernandez", name: "Livan Hernandez", pos: "P", debut: "1996", last: "2012", bats: "R", throws: "R" },
  { id: 117842, slug: "esteban-loaiza", name: "Esteban Loaiza", pos: "P", debut: "1995", last: "2008", bats: "R", throws: "R" },
  { id: 114260, slug: "cliff-floyd", name: "Cliff Floyd", pos: "LF", debut: "1993", last: "2009", bats: "L", throws: "R" },
  { id: 122784, slug: "shannon-stewart", name: "Shannon Stewart", pos: "LF", debut: "1995", last: "2008", bats: "R", throws: "R" },
  { id: 113845, slug: "juan-encarnacion", name: "Juan Encarnacion", pos: "RF", debut: "1997", last: "2007", bats: "R", throws: "R" },
  { id: 133160, slug: "randy-winn", name: "Randy Winn", pos: "CF", debut: "1998", last: "2010", bats: "S", throws: "R" },
  { id: 111904, slug: "mike-cameron", name: "Mike Cameron", pos: "CF", debut: "1995", last: "2011", bats: "R", throws: "R" },
  { id: 424726, slug: "jason-bay", name: "Jason Bay", pos: "LF", debut: "2003", last: "2013", bats: "R", throws: "R" },
  { id: 206551, slug: "melvin-mora", name: "Melvin Mora", pos: "3B", debut: "1999", last: "2011", bats: "R", throws: "R" },
  { id: 406878, slug: "brian-roberts", name: "Brian Roberts", pos: "2B", debut: "2001", last: "2014", bats: "S", throws: "R" },
  { id: 150119, slug: "freddy-garcia", name: "Freddy Garcia", pos: "P", debut: "1999", last: "2013", bats: "R", throws: "R" },
  { id: 457454, slug: "jarrod-saltalamacchia", name: "Jarrod Saltalamacchia", pos: "C", debut: "2007", last: "2018", bats: "S", throws: "R" },
  { id: 407886, slug: "ryan-ludwick", name: "Ryan Ludwick", pos: "RF", debut: "2002", last: "2014", bats: "R", throws: "L" },
];

export const inducteesBySlug = new Map(inductees.map((p) => [p.slug, p]));

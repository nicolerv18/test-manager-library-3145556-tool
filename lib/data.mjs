// Deterministic demo data. Categories are matched by name (the five seeded ones).

const B = (title, author, category, copies) => ({ title, author, category, copies });

export const BOOKS = [
  B('Cien años de soledad', 'Gabriel García Márquez', 'Novela', 4),
  B('El coronel no tiene quien le escriba', 'Gabriel García Márquez', 'Novela', 3),
  B('Crónica de una muerte anunciada', 'Gabriel García Márquez', 'Novela', 3),
  B('Pedro Páramo', 'Juan Rulfo', 'Novela', 3),
  B('Rayuela', 'Julio Cortázar', 'Novela', 2),
  B('La ciudad y los perros', 'Mario Vargas Llosa', 'Novela', 3),
  B('Ficciones', 'Jorge Luis Borges', 'Novela', 4),
  B('El túnel', 'Ernesto Sabato', 'Novela', 2),
  B('María', 'Jorge Isaacs', 'Novela', 3),
  B('La vorágine', 'José Eustasio Rivera', 'Novela', 2),
  B('Don Quijote de la Mancha', 'Miguel de Cervantes', 'Novela', 5),
  B('Los miserables', 'Victor Hugo', 'Novela', 2),
  B('Breve historia del tiempo', 'Stephen Hawking', 'Ciencia', 3),
  B('El origen de las especies', 'Charles Darwin', 'Ciencia', 2),
  B('Cosmos', 'Carl Sagan', 'Ciencia', 4),
  B('El gen egoísta', 'Richard Dawkins', 'Ciencia', 2),
  B('Silent Spring', 'Rachel Carson', 'Ciencia', 2),
  B('La estructura de las revoluciones científicas', 'Thomas Kuhn', 'Ciencia', 2),
  B('Una breve historia de casi todo', 'Bill Bryson', 'Ciencia', 3),
  B('El universo elegante', 'Brian Greene', 'Ciencia', 2),
  B('Clean Code', 'Robert C. Martin', 'Tecnología', 4),
  B('The Pragmatic Programmer', 'Andrew Hunt', 'Tecnología', 3),
  B('Domain-Driven Design', 'Eric Evans', 'Tecnología', 2),
  B('Refactoring', 'Martin Fowler', 'Tecnología', 3),
  B('Design Patterns', 'Erich Gamma', 'Tecnología', 3),
  B('Introduction to Algorithms', 'Thomas H. Cormen', 'Tecnología', 2),
  B('Clean Architecture', 'Robert C. Martin', 'Tecnología', 3),
  B('Designing Data-Intensive Applications', 'Martin Kleppmann', 'Tecnología', 2),
  B('Historia de Colombia', 'Jorge Orlando Melo', 'Historia', 3),
  B('Sapiens', 'Yuval Noah Harari', 'Historia', 4),
  B('Armas, gérmenes y acero', 'Jared Diamond', 'Historia', 2),
  B('Las venas abiertas de América Latina', 'Eduardo Galeano', 'Historia', 3),
  B('Historia de dos ciudades', 'Charles Dickens', 'Historia', 2),
  B('El Mediterráneo', 'Fernand Braudel', 'Historia', 2),
  B('Breve historia del mundo', 'Ernst Gombrich', 'Historia', 3),
  B('Los cañones de agosto', 'Barbara Tuchman', 'Historia', 2),
  B('El principito', 'Antoine de Saint-Exupéry', 'Infantil', 5),
  B('Alicia en el país de las maravillas', 'Lewis Carroll', 'Infantil', 3),
  B('Pinocho', 'Carlo Collodi', 'Infantil', 3),
  B('Platero y yo', 'Juan Ramón Jiménez', 'Infantil', 3),
  B('Momo', 'Michael Ende', 'Infantil', 2),
  B('La historia interminable', 'Michael Ende', 'Infantil', 2),
];

/** ISBN of the demo book number `i` (13 digits, unique, not a real ISBN). */
export const isbnFor = (i) => `9789000000${String(i + 1).padStart(3, '0')}`;

export const MEMBERS = [
  ['Ana María Gómez', '1010001001'], ['Carlos Andrés Ruiz', '1010001002'], ['Laura Sofía Díaz', '1010001003'],
  ['Juan Pablo Torres', '1010001004'], ['María Fernanda Rojas', '1010001005'], ['Santiago Herrera', '1010001006'],
  ['Valentina Castro', '1010001007'], ['Andrés Felipe Mejía', '1010001008'], ['Camila Ortiz', '1010001009'],
  ['Daniel Esteban Vargas', '1010001010'],
].map(([full_name, document_number]) => ({ full_name, document_number }));

const DAY = 86_400_000;

/**
 * The loan plan, relative to "now". Each entry: member index, days ago the loan was made, number of books,
 * and when it was returned (days after the loan) or null if still out.
 * Counts: 15 loans, 3 of them overdue (never returned and older than 14 days), 2 open and not yet due.
 * Per member the loans are chronological and every earlier loan is returned first, so lending never hits MEMBER_HAS_OVERDUE.
 */
export const LOAN_PLAN = [
  // returned loans (history for the report)
  { member: 0, daysAgo: 40, books: 2, returnedAfter: 6 },
  { member: 0, daysAgo: 20, books: 1, returnedAfter: 9 },
  { member: 1, daysAgo: 35, books: 3, returnedAfter: 12 },
  { member: 1, daysAgo: 15, books: 2, returnedAfter: 5 },
  { member: 2, daysAgo: 30, books: 1, returnedAfter: 7 },
  { member: 2, daysAgo: 12, books: 2, returnedAfter: 4 },
  { member: 3, daysAgo: 28, books: 2, returnedAfter: 10 },
  { member: 3, daysAgo: 9, books: 1, returnedAfter: 3 },
  { member: 4, daysAgo: 25, books: 2, returnedAfter: 8 },
  { member: 5, daysAgo: 22, books: 1, returnedAfter: 6 },
  // open, not yet due
  { member: 4, daysAgo: 5, books: 2, returnedAfter: null },
  { member: 5, daysAgo: 3, books: 1, returnedAfter: null },
  // overdue (never returned, older than 14 days)
  { member: 7, daysAgo: 24, books: 1, returnedAfter: null },
  { member: 8, daysAgo: 19, books: 1, returnedAfter: null },
  { member: 9, daysAgo: 16, books: 1, returnedAfter: null },
];

export const daysAgo = (now, n) => new Date(now.getTime() - n * DAY);
export const daysAfter = (date, n) => new Date(date.getTime() + n * DAY);

/** Deterministic pick of `n` distinct book indexes for loan number `k`. */
export function pickBooks(k, n, total = BOOKS.length) {
  const out = [];
  for (let step = 0; out.length < n; step++) {
    const idx = (k * 7 + step * 11 + 3) % total;
    if (!out.includes(idx)) out.push(idx);
  }
  return out;
}

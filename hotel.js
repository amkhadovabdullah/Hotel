const rooms = [
  { title: 'Стандарт', image: 'standard.webp', alt: 'Двуспальная кровать в номере с деревянной отделкой', capacity: 2, area: 24, rate: 4900, description: 'Двуспальная кровать, кресло для чтения и вид на сосновый лес.' },
  { title: 'Делюкс', image: 'deluxe.webp', alt: 'Светлый номер с панорамным окном', capacity: 3, area: 34, rate: 6900, description: 'Панорамное окно с видом на озеро и дополнительное спальное место.' },
  { title: 'Сьют', image: 'suite.webp', alt: 'Гостиная с диваном и панорамным остеклением', capacity: 4, area: 52, rate: 9900, description: 'Отдельная спальня, гостиная с диваном и панорамный вид на лес.' },
];
const booking = document.querySelector('#booking');
const arrival = document.querySelector('#arrival');
const departure = document.querySelector('#departure');
const guests = document.querySelector('#guests');
const roomStatus = document.querySelector('#room-status');
const dialog = document.querySelector('#reservation');
const confirmation = document.querySelector('#confirmation');
const receipt = document.querySelector('#receipt');
const rubles = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeZone: 'UTC' });
const day = 86400000;
let selected;

const toISO = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
const nextDate = value => new Date(Date.parse(value) + day).toISOString().slice(0, 10);

arrival.min = toISO(new Date());
arrival.value = arrival.min;
function updateDeparture() {
  departure.min = nextDate(arrival.value || arrival.min);
  if (departure.value < departure.min) departure.value = departure.min;
}
updateDeparture();

const cards = rooms.map(room => {
  const card = document.querySelector('#room-template').content.firstElementChild.cloneNode(true);
  const image = card.querySelector('img');
  image.src = room.image;
  image.alt = room.alt;
  card.querySelector('.spec').textContent = room.area + ' м² · До ' + room.capacity + ' гостей';
  card.querySelector('h3').textContent = room.title;
  card.querySelector('.description').textContent = room.description;
  card.querySelector('.price strong').textContent = rubles.format(room.rate);
  card.querySelector('button').addEventListener('click', () => openReservation(room));
  document.querySelector('#room-list').append(card);
  return card;
});

function filterRooms() {
  cards.forEach((card, index) => { card.hidden = rooms[index].capacity < Number(guests.value); });
}

function showResults() {
  filterRooms();
  const count = cards.filter(card => !card.hidden).length;
  roomStatus.textContent = 'Подходящих категорий по числу гостей: ' + count + '. Доступность на даты в демоверсии не проверяется.';
}

function openReservation(room) {
  if (!booking.reportValidity() || room.capacity < Number(guests.value)) return;
  const nights = (Date.parse(departure.value) - Date.parse(arrival.value)) / day;
  selected = { room: room.title, arrival: arrival.value, departure: departure.value, guests: Number(guests.value), nights, total: room.rate * nights };
  document.querySelector('#summary').textContent = room.title + ' · ' + dateFormat.format(new Date(selected.arrival)) + ' — ' + dateFormat.format(new Date(selected.departure)) + ' · Гостей: ' + selected.guests + ' · Ночей: ' + nights + ' · Итого ' + rubles.format(selected.total);
  confirmation.hidden = false;
  receipt.hidden = true;
  dialog.showModal();
}

arrival.addEventListener('change', updateDeparture);
guests.addEventListener('change', showResults);
booking.addEventListener('submit', event => {
  event.preventDefault();
  showResults();
  document.querySelector('#rooms').scrollIntoView();
});
confirmation.addEventListener('submit', event => {
  event.preventDefault();
  const reference = Date.now().toString(36).toUpperCase();
  const message = document.querySelector('#receipt-text');
  try {
    const key = 'tikhiy-bereg-demo-reservations';
    const previous = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...previous, { ...selected, reference }]));
    message.textContent = 'Тестовая бронь № ' + reference + ' сохранена. ' + selected.room + ' · ' + rubles.format(selected.total) + '.';
  } catch {
    message.textContent = 'Браузер не смог сохранить тестовую бронь.';
  }
  confirmation.hidden = true;
  receipt.hidden = false;
  document.querySelector('#done').focus();
});
document.querySelector('#close').addEventListener('click', () => dialog.close());
document.querySelector('#done').addEventListener('click', () => dialog.close());

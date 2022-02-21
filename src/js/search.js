import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import createCardMarkup from './templates/card.hbs';
import PixabayApiService from './PixabayApiService';

const gallery = new SimpleLightbox('.gallery__card');
const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery__container'),
  moreBtn: document.querySelector('.load-more'),
};
const pixabayApiService = new PixabayApiService();
const observer = new IntersectionObserver(onObserve, { threshold: 0.7 });
let isObserving = false;
let searchTime = Date.now();
refs.form.addEventListener('submit', onSearch);

async function onSearch(e) {
  e.preventDefault();
  if (Date.now() - searchTime < 1000) return;
  if (isObserving) {
    observer.unobserve(refs.gallery.lastElementChild);
  }
  searchTime = Date.now();
  e.target.searchQuery.placeholder = 'Search images...';
  pixabayApiService.resetPage();
  clearGallery();
  const searchQuery = e.target.searchQuery.value.trim();
  if (!searchQuery) return;
  pixabayApiService.query = searchQuery;
  await loadMore();
  e.target.reset();
  e.target.searchQuery.placeholder = searchQuery;
}
async function loadMore() {
  try {
    const response = await pixabayApiService.getImages();
    onSuccess(response);
  } catch (error) {
    onError(error);
  }
}
function onSuccess(response) {
  const cards = response.data.hits;
  const totalHits = response.data.totalHits;
  if (cards.length === 0 && totalHits === 0) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    return;
  }
  if (totalHits <= (pixabayApiService.page - 1) * 40) {
    Notify.failure("We're sorry, but you've reached the end of search results.");
    return;
  }
  if (pixabayApiService.page === 2) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }
  const cardsMarkup = createCardsMarkup(cards);

  addCardsToGallery(cardsMarkup);
  gallery.refresh();
  observer.observe(refs.gallery.lastElementChild);
  isObserving = true;
}
function onError() {
  Notify.failure('Sorry, there is no response from server. Please try again.');
}
function createCardsMarkup(cards) {
  return cards.map(createCardMarkup).join('');
}
function addCardsToGallery(markup) {
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}
function clearGallery() {
  refs.gallery.innerHTML = '';
}

function onObserve(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      isObserving = false;
      loadMore();
    }
  });
}

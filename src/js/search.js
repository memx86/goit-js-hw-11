import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';
import createCardMarkup from './templates/card.hbs';
import PixabayApiService from './PixabayApiService';

const gallery = new SimpleLightbox('.gallery__card');
const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery__container'),
  moreBtn: document.querySelector('.load-more'),
};
const pixabayApiService = new PixabayApiService();
const onScrollThrottled = throttle(onScroll, 250);
let isScrollListener = false;

refs.form.addEventListener('submit', onSearch);

async function onSearch(e) {
  e.preventDefault();
  pixabayApiService.resetPage();
  clearGallery();
  pixabayApiService.query = e.target.searchQuery.value.trim();
  await loadMore();
  if (!isScrollListener) {
    window.addEventListener('scroll', onScrollThrottled);
    isScrollListener = true;
  }
}
async function loadMore() {
  try {
    const response = await pixabayApiService.getArticles();
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
    window.removeEventListener('scroll', onScrollThrottled);
    isScrollListener = false;
    return;
  }
  if (cards.length === 0 && totalHits !== 0) {
    Notify.failure("We're sorry, but you've reached the end of search results.");
    window.removeEventListener('scroll', onScrollThrottled);
    isScrollListener = false;
    return;
  }
  if (pixabayApiService.page === 2) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }
  const cardsMarkup = createCardsMarkup(cards);

  addCardsToGallery(cardsMarkup);
  gallery.refresh();
}
function onError(error) {
  window.removeEventListener('scroll', onScrollThrottled);
  isScrollListener = false;
  if (error.response.status === 400) {
    Notify.failure("We're sorry, but you've reached the end of search results.");
    return;
  }
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
async function onScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
  const { height: cardHeight } = refs.gallery.firstElementChild.getBoundingClientRect();

  // scroll starts to execute on 1 card height and less from bottom of document
  if (scrollTop + clientHeight < scrollHeight - cardHeight) {
    return;
  }
  await loadMore();
}

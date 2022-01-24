import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import createCardMarkup from './templates/card.hbs';
import axios from 'axios';
import throttle from 'lodash.throttle';
const gallery = new SimpleLightbox('.gallery__card');
const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery__container'),
  moreBtn: document.querySelector('.load-more'),
};
let query = '';
let page = 1;
let isScrollListener = false;
const onScrollThrottled = throttle(onScroll, 250);

refs.form.addEventListener('submit', onSearch);
// refs.moreBtn.addEventListener('click', onMoreBtnClick);

async function onSearch(e) {
  e.preventDefault();
  page = 1;
  clearGallery();
  query = e.target.searchQuery.value.trim();
  await loadMore(query);
  if (!isScrollListener) {
    window.addEventListener('scroll', onScrollThrottled);
    isScrollListener = true;
  }
}
async function loadMore(query) {
  const API_KEY = '25272385-d3b781fb1902e693cd197cf56';
  const BASE_URL = 'https://pixabay.com/api/';
  const DEFAULT_QUERY = '&per_page=40&image_type=photo&orientation=horizontal&safesearch=true';
  const url = `${BASE_URL}?key=${API_KEY}&q=${query}&page=${page}${DEFAULT_QUERY}`;
  try {
    const response = await axios.get(url);
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
  if (page === 1) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }
  const cardsMarkup = createCardsMarkup(cards);

  addCardsToGallery(cardsMarkup);
  page += 1;
  gallery.refresh();
  // showButton();
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
  await loadMore(query);
}

// async function onMoreBtnClick() {
//   hideButton();
//   loadMore(query);
//   scrollPage();
// }
//
// Load more button
//
// function hideButton() {
//   refs.moreBtn.classList.add('is-hidden');
// }
// function showButton() {
//   refs.moreBtn.classList.remove('is-hidden');
// }
// function scrollPage() {
//   const { height: cardHeight } = refs.gallery.firstElementChild.getBoundingClientRect();
//
//   window.scrollBy({
//     top: cardHeight * 2,
//     behavior: 'smooth',
//   });
// }

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import cardMarkup from './templates/card.hbs';
const axios = require('axios');
const gallery = new SimpleLightbox('.gallery__card');
const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery__container'),
  moreBtn: document.querySelector('.load-more'),
};
const API_KEY = '25272385-d3b781fb1902e693cd197cf56';
const BASE_URL = 'https://pixabay.com/api/';
const DEFAULT_QUERY = '&per_page=40&image_type=photo&orientation=horizontal&safesearch=true';
let query = '';
let page = 1;

refs.form.addEventListener('submit', onSearch);
refs.moreBtn.addEventListener('click', onMoreBtnClick);

async function onSearch(e) {
  e.preventDefault();
  page = 1;
  clearGalleryMarkup();
  query = e.target.searchQuery.value.trim();
  const url = `${BASE_URL}?key=${API_KEY}&q=${query}&page=${page}${DEFAULT_QUERY}`;
  try {
    const response = await axios.get(url);
    onSuccess(response);
  } catch {
    onError();
  }
}
function onSuccess(response) {
  const cards = response.data.hits;
  if (cards.length === 0) {
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    return;
  }
  const totalHits = response.data.totalHits;
  const cardsMarkup = cards.map(cardMarkup).join('');

  Notify.success(`Hooray! We found ${totalHits} images.`);
  refs.gallery.insertAdjacentHTML('beforeend', cardsMarkup);
  page += 1;
  gallery.refresh();
  showButton();
}
function onError() {
  Notify.failure('Sorry, there is no response from server. Please try again.');
}
async function onMoreBtnClick() {
  hideButton();
  const url = `${BASE_URL}?key=${API_KEY}&q=${query}&page=${page}${DEFAULT_QUERY}`;
  try {
    const response = await axios.get(url);
    onSuccess(response);
  } catch {
    onError();
  }
  scrollPage();
}
function hideButton() {
  refs.moreBtn.classList.add('is-hidden');
}
function showButton() {
  refs.moreBtn.classList.remove('is-hidden');
}
function clearGalleryMarkup() {
  refs.gallery.innerHTML = '';
}
function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery__container')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

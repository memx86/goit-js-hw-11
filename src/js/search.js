import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import cardMarkup from './templates/card.hbs';
const axios = require('axios');

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery__container'),
};

const API_KEY = '25272385-d3b781fb1902e693cd197cf56';
const BASE_URL = 'https://pixabay.com/api/';
const DEFAULT_QUERY = '&per_page=40&image_type=photo&orientation=horizontal&safesearch=true';
let query = '';
let page = 1;

refs.form.addEventListener('submit', onSearch);

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
  let gallery = new SimpleLightbox('.gallery__container a');
  gallery.refresh();
}
function onError() {
  Notify.failure('Sorry, there is no response from server. Please try again.');
}
function onSearch(e) {
  page = 1;
  e.preventDefault();
  query = e.target.searchQuery.value;
  const url = `${BASE_URL}?key=${API_KEY}&q=${query}&page=${page}${DEFAULT_QUERY}`;
  axios.get(url).then(onSuccess).catch(onError);
}

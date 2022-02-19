import axios from 'axios';

export default class PixabayApiService {
  static #API_KEY = '25272385-d3b781fb1902e693cd197cf56';
  static #BASE_URL = 'https://pixabay.com/api/';
  constructor() {
    axios.defaults.baseURL = PixabayApiService.#BASE_URL;
    this.page = 1;
    this.searchQuery = '';
  }
  getImages() {
    const params = new URLSearchParams({
      q: this.searchQuery,
      page: this.page,
      per_page: 40,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      key: PixabayApiService.#API_KEY,
    });
    const url = `?${params}`;
    return axios.get(url).then(response => {
      this.incrementPage();
      return response;
    });
  }
  incrementPage() {
    this.page += 1;
  }
  resetPage() {
    this.page = 1;
  }
  get query() {
    return this.searchQuery;
  }
  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
